# angular-csv-parser

An angularjs service with methods to turn strings representing CSV files into
arrays of objects and vice-versa.

## Use

Include the angular-csv-parser.js file into your project by doing either

```javascript
require("angular-csv-parser");
```

or

```html
<script src="angular-csv-parser.js"></script>
```

### Parsing

Use `parse` to convert a string containing a valid CSV string into an array of
objects.

```javascript
angular.module("my-module", ["angular-csv-parser"])
  .controller("MyController", ["CSVParser", function (CSVParser) {
    let string = "header1,header2,header3\n"
               + "value 1,value 2,value 3\n"
               + "value 4,value 5,value 6";

    let result = CSVParser.parse(string);

    // result is
    // [{
    //   header1: "value 1",
    //   header2: "value 2",
    //   header2: "value 3",
    // },{
    //   header1: "value 4",
    //   header2: "value 5",
    //   header2: "value 6",
    // }]
});
```

### CSVfiying

Use `csvify` to convert an array of objects into a string in CSV format.

```javascript
angular.module("my-module", ["angular-csv-parser"])
  .controller("MyController", ["CSVParser", function (CSVParser) {
    let array = [{
      header1: "value 1",
      header2: "value 2",
      header2: "value 3",
    },{
      header1: "value 4",
      header2: "value 5",
      header2: "value 6",
    }];

    let string = CSVParser.csvify(array);

    // string is "header1,header2,header3\n"
    //         + "value 1,value 2,value 3\n"
    //         + "value 4,value 5,value 6";
});
```

Every object in the array must have the same attribute names.

If you want to create a CSV file with only a header, you can use `csvifyEmpty`

```javascript
angular.module("my-module", ["angular-csv-parser"])
  .controller("MyController", ["CSVParser", function (CSVParser) {
    let headers = ["header1", "header2", "header3"];

    let string = CSVParser.csvify(array);

    // string is "header1,header2,header3"
});
```

## Testing

### Single run

`npm test`

### Continuous

`karma start`
