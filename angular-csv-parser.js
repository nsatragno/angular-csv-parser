/**
 * Provides methods to parse strings representing CSV files and csvify object
 * arrays into strings.
 */
angular.module("angular-csv-parser", [])
  .factory("CSVParser", ["$log", function ($log) {

    const CSV_MIME_TYPE = "text/csv";

    let _encode = function (value) {
      if (value === null || typeof value === "undefined") {
        return "";
      } else if (value === "") {
        return "\"\"";
      }
      // Replace all " by "" to escape them.
      value = ("" + value).split("\"").join("\"\"");
      if (value.indexOf(",") === -1 && value.indexOf("\"") === -1) {
        return value;
      }

      // Surround when the value contains quotes or commas.
      return "\"" + value + "\"";
    };

    let _decode = function (value) {
      if (value.startsWith("\"") && value.endsWith("\"")) {
        value = value.substring(1, value.length - 1);
      }
      // Replace all "" by " to unescape them.
      return value.split("\"\"").join("\"");
    };

    /**
     * Splits the row into an array of comma separated values.
     * This implements the following automaton:
     *
     *                 normal or , char
     *                      +-----+
     *                      |     |
     *          " char   +--------v-+
     *                   |          |
     *     +------------->  Escape  |
     *     |             |          |
     *     |             +--------^-+
     * +---------+         |      |         +---------+
     * |         |  " char |      | " char  |         |
     * |  Start  |         |      |         |   End   |
     * |         |         |      |         |         |
     * +---------+         |      |         +----^----+
     *     |             +-v--------+            |
     *     |             |          |            |
     *     +------------->  Normal  +------------+
     *                   |          |
     *       normal char +-------^--+    , char
     *                      |    |
     *                      +----+
     *                   normal char
     *
     * Where "normal char" means anything but , or ".
     */
    let _split = function (row) {
      let values = [];

      for (let i = 0; i < row.length; ++i) {
        let currentValue = "";
        // Start state.
        for (; row.charAt(i) !== "," && i < row.length; ++i) {
          if (row.charAt(i) === "\"") {
            // Enter the escape state until a , is found.
            do {
              currentValue += row.charAt(i);
              ++i;
              if (i >= row.length) {
                // The line finished before we closed the escape state. Log an
                // error and make sure we don't get stuck in an infinite loop.
                $log.warn("Invalid CSV line: " + row);
                break;
              }
            } while (row.charAt(i) !== "\"");
          }
          // Normal state.
          currentValue += row.charAt(i);
        }
        // End state.
        values.push(currentValue);
      }

      return values;
    };

    /**
     * Parses the CSV file.
     *
     * @param text a string containing the CSV file contents.
     * @return an object with a "titles" attribute containing the csv file object
     * titles and a "content" attribute containing the parsed rows as javascript
     * objects, with each key corresponding to a title.
     */
    let parse = function (text) {
      let lines = text.split("\n");

      // Windows style endings might be present if the file was uploaded by a DOS
      // compatible OS, but JS may not be smart about them. Trim them.
      lines = lines.map(line => line.trim());
      let header = lines[0];
      let body = lines.slice(1);

      let titles = _split(header).map(_decode);
      let content = body.filter(line => line !== "")
                        .map(line => {
        let index = -1;
        // Put each comma separated value attribute in an object with keys from
        // the title.
        return _split(line).reduce((object, next) => {
          object[titles[++index]] = _decode(next);
          return object;
        }, {});
      });

      return {
        titles: titles,
        content: content,
      };
    };

    /**
     * Produces a CSV file. This function assumes every object passed as content
     * has the exact same parameters.
     *
     * @param content an array with the content to be transformed into a CSV file.
     * @return a string with the contents of the generated CSV file.
     */
    let csvify = function (content) {
      let titles = Object.keys(content[0]);
      // Remove attributes inserted by angular.
      let hashKeyIndex = titles.indexOf("$$hashKey");
      if (hashKeyIndex !== -1) {
        titles.splice(hashKeyIndex, 1);
      }

      let header = titles.map(_encode).join(",");
      let body = content.map(
        object => titles.map(title => _encode(object[title]))
                        .join(",")).join("\n");

      return header + "\n" + body;
    };

    /**
     * Produces an empty CSV file with the given headers.
     *
     * @param titles an array with the CSV headers.
     * @return a string with the contents of the generated CSV file.
     */
    let csvifyEmpty = function (titles) {
      return titles.map(_encode).join(",");
    };

    return {
      CSV_MIME_TYPE: CSV_MIME_TYPE,

      parse: parse,
      csvify: csvify,
      csvifyEmpty: csvifyEmpty,
    };
  }]);
