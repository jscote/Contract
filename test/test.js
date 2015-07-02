/**
 * Created by jean-sebastiencote on 11/1/14.
 */


var Arguments = require('../index').Arguments;
var Argument = require('../index').Argument;
var TaskContract = require('../index').Contract;


module.exports = {
    testArgumentsCanBeCreated: function (test) {
        var args = new Arguments();
        test.ok(args);
        test.done();
    },
    testArgumentCanBeCreated: function (test) {
        var arg = new Argument({name: 'testArgument', direction: Argument.Direction.in, value: "test"});
        test.ok(arg.name == "testArgument", "Name is not set correctly");
        test.ok(arg.direction == Argument.Direction.in, "Direction is not set correctly");
        test.ok(arg.value == "test", "value is not set correctly");

        test.done();
    },
    testArgumentCannotBeCreatedWithInvalidDirection: function (test) {

        test.throws(function () {
            new Argument({name: 'testArgument', direction: "stuff", value: "test"});
        });
        test.done();


    },
    testArgumentWithoutDirectionWillBeInOut: function (test) {
        var arg = new Argument({name: 'testArgument', value: "test"});
        test.ok(arg.name == "testArgument", "Name is not set correctly");
        test.ok(arg.direction == Argument.Direction.inOut, "Direction is not set correctly");
        test.ok(arg.value == "test", "value is not set correctly");

        test.done();
    },
    testArgumentCanBeAddedToArguments: function (test) {
        var arg = new Argument({name: 'testArgument', value: "test"});
        var args = new Arguments();

        args.add(arg);
        test.ok(args.in.get("testArgument") == "test", "in argument set correctly");
        test.ok(args.out.get("testArgument") == "test", "out argument set correctly");

        test.done();
    },
    testArgumentsCanBeFlatten: function (test) {

        var arg = new Argument({name: 'testArgument', value: "test"});
        var arg1 = new Argument({name: 'testAnotherArgument', value: {name: "test"}});

        var args = new Arguments();

        args.add(arg);
        args.add(arg1);

        var flatten = args.out.flatten();

        test.ok(flatten.testArgument == "test");
        test.ok(flatten.testAnotherArgument.name == "test");

        test.done();
    },
    testNoDefinitionsWillNotCreateContract: function (test) {

        test.throws(function () {
            new TaskContract();
        });

        test.done();
    },
    testDefinitionWihtoutNameWillNotCreateContract: function (test) {
        test.throws(function () {
            new TaskContract([{}]);
        });

        test.done();
    },
    testDefinitionsNotAnArrayWillNotCreateContract: function (test) {
        test.throws(function () {
            new TaskContract({});
        });
        test.done();
    },
    testDefinitionWithNameOnlyWillCreateContract: function (test) {
        var contract = new TaskContract([{name: "something"}]);

        test.ok(contract !== null);
        test.ok(contract !== undefined);
        test.ok(contract.definitions.something !== null);
        test.ok(contract.definitions.something !== undefined);
        test.ok(contract.definitions.something.direction === Argument.Direction.inOut);

        test.done();
    },
    testDefinitionWithNameAndDirectionWillCreateContract: function (test) {
        var contract = new TaskContract([{name: "something", direction: Argument.Direction.in}]);

        test.ok(contract !== null);
        test.ok(contract !== undefined);
        test.ok(contract.definitions.something !== null);
        test.ok(contract.definitions.something !== undefined);
        test.ok(contract.definitions.something.direction === Argument.Direction.in);

        test.done();
    },
    testWithMultipleDefinitionsWillCreateContract: function (test) {
        var contract = new TaskContract([{name: "something", direction: Argument.Direction.in}, {
            name: "somethingElse",
            direction: Argument.Direction.out
        }, {name: "andAnother"}]);


        test.ok(contract !== null);
        test.ok(contract !== undefined);
        test.ok(contract.definitions.something !== null);
        test.ok(contract.definitions.something !== undefined);
        test.ok(contract.definitions.something.direction === Argument.Direction.in);

        test.ok(contract.definitions.somethingElse !== null);
        test.ok(contract.definitions.somethingElse !== undefined);
        test.ok(contract.definitions.somethingElse.direction === Argument.Direction.out);

        test.ok(contract.definitions.andAnother !== null);
        test.ok(contract.definitions.andAnother !== undefined);
        test.ok(contract.definitions.andAnother.direction === Argument.Direction.inOut);

        test.done();
    },
    testWithMultipleDefinitionsWillCreateArguments: function (test) {
        var contract = new TaskContract([{name: "something", direction: Argument.Direction.in}, {
            name: "somethingElse",
            direction: Argument.Direction.out
        }, {name: "andAnother"}]);

        var args = contract.createArguments();
        args.in.set("something", "test");
        args.in.set("andAnother", {name: "test"});
        test.ok(args.in.get("something") == "test");
        test.ok(args.in.get("andAnother").name == "test");

        test.ok(args.out.get("somethingElse") === undefined, "the value of out argument should not be defined yet");

        test.done();
    },
    testValidMapWillProduceFullMap: function (test) {

        var map = TaskContract.createMap({"name": "firstName"});

        test.ok(map.name.key == "firstName");
        test.ok(map.name.transform instanceof Function);
        var coll = new TaskContract([{name: "firstName", direction: Argument.Direction.in}]).createArguments();
        var args = map.name.transform("bob", null, coll.in);
        test.ok(args.name == "firstName");
        test.ok(args.value == "bob");

        test.done();
    },
    testMapWithFunctionWillProduceFullMap: function (test) {

        var map = TaskContract.createMap({
            "name": {
                key: "firstName", transform: function () {
                    return "bob from function"
                }
            }
        });

        test.ok(map.name.key == "firstName");
        test.ok(map.name.transform instanceof Function);
        var coll = new TaskContract([{name: "firstName", direction: Argument.Direction.in}]).createArguments();
        var args = map.name.transform("bob", null, coll.in);
        test.ok(args.name == "firstName");
        test.ok(args.value == "bob from function");

        test.done();
    }
};