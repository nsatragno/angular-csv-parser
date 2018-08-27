describe("angular-csv-parser", function() {
  let CSVParser;
  let $log;

  beforeEach(function () {
    module("angular-csv-parser");
  });

  beforeEach(angular.mock.inject([
    "CSVParser", "$log",
    function(_CSVParser_, _$log_) {
      $log = _$log_;
      CSVParser = _CSVParser_;
    },
  ]));

  describe("parse()", function () {
    it("parses an empty file", function () {
      expect(CSVParser.parse("")).toEqual({
        titles: [],
        content: [],
      });
    });

    it("parses a file with only titles", function () {
      let file = "one,two,three";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "two", "three"],
        content: [],
      });
    });

    it("parses a file with content", function () {
      let file = "one,two,three\n"
               + "a,b,c\n"
               + "d,,f";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "two", "three"],
        content: [{
          one: "a",
          two: "b",
          three: "c",
        },{
          one: "d",
          two: "",
          three: "f",
        }],
      });
    });

    it("parses a file with windows style line ends", function () {
      let file = "one,two,three\r\n"
               + "a,b,c\r\n"
               + "d,,f";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "two", "three"],
        content: [{
          one: "a",
          two: "b",
          three: "c",
        },{
          one: "d",
          two: "",
          three: "f",
        }],
      });
    });

    it("parses a file with escaped commas", function () {
      let file = "one,\"two, two and a half\",three\n"
               + "a,\"b,b.5\",c\n"
               + "d,,f";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "two, two and a half", "three"],
        content: [{
          one: "a",
          "two, two and a half": "b,b.5",
          three: "c",
        },{
          one: "d",
          "two, two and a half": "",
          three: "f",
        }],
      });
    });

    it("parses a file with escaped quotes", function () {
      let file = `one,"two,""two""",three\n`
               + `a,"b,""b""",c\n`
               + "d,,f";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "two,\"two\"", "three"],
        content: [{
          one: "a",
          "two,\"two\"": "b,\"b\"",
          three: "c",
        },{
          one: "d",
          "two,\"two\"": "",
          three: "f",
        }],
      });
    });

    it("parses a file with broken quotes", function () {
      // Notice the second pair of quotes on the right of `two` is broken.
      let file = `one,"two,""two"",three\n`
               + `a,b,c\n`
               + "d,,f";
      expect(CSVParser.parse(file)).toEqual({
        titles: ["one", "\"two,\"two\",three"],
        content: [{
          one: "a",
          "\"two,\"two\",three": "b",
          undefined: "c",
        },{
          one: "d",
          "\"two,\"two\",three": "",
          undefined: "f",
        }],
      });
      expect($log.warn.logs).toEqual([[
        `Invalid CSV line: one,"two,""two"",three`]]);
    });
  });

  describe("csvify", function () {
    it("converts an object to CSV", function () {
      let object = [{
        one: "1",
        two: "2",
      },{
        one: null,
        two: "",
      }];
      expect(CSVParser.csvify(object)).toEqual("one,two\n"
                                              + "1,2\n"
                                              + ",\"\"");
    });

    it("ignores $hashkey", function () {
      let object = [{
        one: "1",
        two: "2",
        "$$hashKey": "asd",
      },{
        one: null,
        two: "",
        "$$hashKey": "qwe",
      }];
      expect(CSVParser.csvify(object)).toEqual("one,two\n"
                                              + "1,2\n"
                                              + ",\"\"");
    });

    it("escapes commas", function () {
      let object = [{
        "one,num": "1,uno",
        two: "2",
      },{
        "one,num": "uno",
        two: "dos",
      }];
      expect(CSVParser.csvify(object)).toEqual(`"one,num",two\n`
                                              + `"1,uno",2\n`
                                              + "uno,dos");
    });

    it("escapes quotes", function () {
      let object = [{
        "one,\"num\"": "1,\"uno\"",
        two: "2",
      },{
        "one,\"num\"": "uno",
        two: "dos",
      }];
      expect(CSVParser.csvify(object)).toEqual(`"one,""num""",two\n`
                                              + `"1,""uno""",2\n`
                                              + "uno,dos");
    });
  });

  describe("csvifyEmpty()", function () {
    it("allows creating a CSV file with only titles", function () {
      let titles = ["uno", "\"dos\"", "tres,cuatro"];
      expect(CSVParser.csvifyEmpty(titles)).toEqual(
        `uno,"""dos""","tres,cuatro"`);
    });
  });
});

