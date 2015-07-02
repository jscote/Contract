/**
 * Created by jean-sebastiencote on 11/1/14.
 */
(function (util, _) {

    'use strict';

    Argument.Direction = {
        in: 1,
        out: 2,
        inOut: 3
    };

    function ArgumentDefinition(options) {
        if (!_.isUndefined(options.direction) && !(options.direction === Argument.Direction.in
            || options.direction === Argument.Direction.inOut
            || options.direction === Argument.Direction.out)) {
            throw Error("Invalid Direction");
        }
        var _direction = _.isUndefined(options.direction) ? Argument.Direction.inOut : options.direction;
        Object.defineProperty(this, 'name', {writable: false, enumerable: true, value: options.name});
        Object.defineProperty(this, 'direction', {
            get: function () {
                return _direction;
            },
            set: function (value) {
                if (value != _direction && !(options.direction === 0 || options.direction === 1 || options.direction === 3)) {
                    _direction = value;
                }
            }
        })

    }

    function Argument(options) {
        ArgumentDefinition.call(this, options);
        Object.defineProperty(this, 'value', {writable: true, enumerable: true, value: options.value});
    }

    util.inherits(Argument, ArgumentDefinition);

    Argument.prototype.flatten = function () {
        return this.value;
    };

    function ArgumentDefinitionCollection(argumentDirection) {

        Object.defineProperty(this, "direction", {writable: false, enumerable: true, value: argumentDirection});
    }


    ArgumentDefinitionCollection.prototype.getArgumentObject = function (argumentName) {
        if (_.isUndefined(this[argumentName])) {
            throw Error("Argument doesn't exist");
        }

        return this[argumentName];
    };

    ArgumentDefinitionCollection.prototype.setArgumentObject = function (argument) {
        if (!(argument instanceof ArgumentDefinition)) {
            throw Error("Not a valid argument");
        }

        if (argument.direction !== Argument.Direction.in
            && argument.direction !== Argument.Direction.out
            && argument.direction !== Argument.Direction.inOut) {
            throw Error("Argument has incompatible direction");
        }

        this[argument.name] = argument;
        return argument;
    };


    function ArgumentCollection(argumentDirection) {

        if (_.isUndefined(argumentDirection) || !(argumentDirection === Argument.Direction.in
            || argumentDirection === Argument.Direction.out)) {
            throw Error("Invalid Direction");
        }

        ArgumentDefinitionCollection.call(this, argumentDirection);

    }

    util.inherits(ArgumentCollection, ArgumentDefinitionCollection);

    ArgumentCollection.prototype.get = function (argumentName) {
        if (_.isUndefined(this[argumentName])) {
            throw Error("Argument doesn't exist");
        }

        return this[argumentName].value;
    };

    ArgumentCollection.prototype.flatten = function () {
        var obj = {};

        for (var prop in this) {
            if (this[prop] instanceof Argument) {
                obj[prop] = this[prop].flatten();
            }
        }
        return obj;
    };

    ArgumentCollection.prototype.set = function (argumentName, argumentValue) {
        if (_.isUndefined(this[argumentName])) {
            throw Error("Argument doesn't exist");
        }

        this[argumentName].value = argumentValue;
        return this[argumentName].value;
    };

    ArgumentCollection.prototype.setArgumentObject = function (argument) {
        if (!(argument instanceof Argument)) {
            throw Error("Not a valid argument");
        }

        if (!(argument.direction === this.direction) && (argument.direction !== Argument.Direction.inOut)) {
            throw Error("Argument has incompatible direction");
        }

        this[argument.name] = argument;
        return argument;
    };


    function Arguments() {
        var _in = new ArgumentCollection(Argument.Direction.in);
        var _out = new ArgumentCollection(Argument.Direction.out);

        Object.defineProperty(this, "in", {writable: false, enumerable: true, value: _in});
        Object.defineProperty(this, "out", {writable: false, enumerable: true, value: _out});
    }

    Arguments.prototype.add = function (arg) {
        if (arg instanceof Argument) {
            switch (arg.direction) {
                case Argument.Direction.in:
                    this.in.setArgumentObject(arg);
                    break;
                case Argument.Direction.out:
                    this.out.setArgumentObject(arg);
                    break;
                case Argument.Direction.inOut:
                    this.in.setArgumentObject(arg);
                    this.out.setArgumentObject(arg);
                    break;
            }

            return arg;
        }

        return null;
    };

    function Contract(argumentDefinitions) {
        if (!_.isArray(argumentDefinitions)) {
            throw Error("Expecting an array of argument definitions");
        }
        var _definitions = new ArgumentDefinitionCollection(Argument.Direction.inOut);
        Object.defineProperty(this, "definitions", {enumerable: true, writable: false, value: _definitions});

        _.forEach(argumentDefinitions, function (definition) {
            if (_.isUndefined(definition.name)) throw Error("definition should have a name");
            if (!_.isUndefined(definition.direction) &&
                (definition.direction !== Argument.Direction.in
                && definition.direction !== Argument.Direction.out
                && definition.direction !== Argument.Direction.inOut)) {
                throw Error("direction is invalid");
            }

            _definitions.setArgumentObject(new ArgumentDefinition(definition));
        });
    }

    Contract.prototype.createArguments = function () {
        var args = new Arguments();

        _.forEach(this.definitions, function (definition) {
            args.add(new Argument(definition));
        });

        return args;
    };

    function getSimpleMap(originalMap, property) {
        return {
            key: originalMap[property], transform: function (value, objfrom, objTo) {
                objTo.set(originalMap[property], value);
                return objTo.getArgumentObject(originalMap[property]);
            }
        }
    }

    function getComplexMap(originalMap, property) {
        return {
            key: originalMap[property].key, transform: function(value, objFrom, objTo) {
                objTo.set(originalMap[property].key, originalMap[property].transform(value, objFrom, objTo));
                return objTo.getArgumentObject(originalMap[property].key);
            }
        }
    }

    Contract.createMap = function (originalMap) {
        var newInMap = {};
        for (var prop in originalMap) {
            (function (property) {
                newInMap[property] = _.isString(originalMap[property]) ? getSimpleMap(originalMap, property) : getComplexMap(originalMap, property);
            })(prop);
        }
        return newInMap;
    };


    exports.Argument = Argument;
    exports.Arguments = Arguments;
    exports.Contract = Contract;


})
(
    module.require('util'),
    module.require('lodash')
);