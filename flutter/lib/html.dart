import 'package:http/http.dart' as http;
import 'dart:io';
import './general.dart';

const String ADDRESS_URL = 'http://127.0.0.1:8000/';
String middlewareUrl = ADDRESS_URL;

class MyHtml {
  static Future<File> getHostFile() async {
    Directory main = await General.getLocaleDir();
    return File("${main.path}/addr");
  }
  static Future<File> getMiddlewareHostFile() async {
    Directory main = await General.getLocaleDir();
    return File("${main.path}/middleware");
  }

  static Future<String> getHost() async {
    File fileHost = await getHostFile();
    return fileHost.readAsStringSync();
  }

  static Future<void> setMiddlewareHost(String host) async {
    General.innerDebug("[setMiddlewareHost] $host");

    File file = await getMiddlewareHostFile();
    file.writeAsString(host);

    middlewareUrl = host;
  }
  static Future<void> syncMiddlewareHost() async {
    File file = await getMiddlewareHostFile();
    String host = await file.readAsStringSync();

    middlewareUrl = host;
  }

  static Future<File> getHtmlFile() async {
    Directory main = await General.getLocaleDir();
    return File("${main.path}/index.html");
  }

  static Future<String> getHtml(String host) async {
    File fileHtml = await getHtmlFile();
    await syncMiddlewareHost();

    if (fileHtml.existsSync()) {
      General.innerDebug("HTML template: Reading from cache");
      return fileHtml.readAsStringSync();
    }

    await syncHtmlTemplate();

    File fileRes = await getHtmlFile();
    return fileRes.readAsStringSync();
  }

  static Future<bool> downloadHtml(String url) async {
    File file = await getHostFile();

    General.innerDebug("[downloadHtml] downloading html ${file.path} from $url");

    try {
      final response = await http.get(Uri.parse(url));

      File htmlFile = await getHtmlFile();
      await htmlFile.writeAsString(response.body);

      General.innerDebug("[downloadHtml] got template ${response.statusCode}");
    } catch(error) {
      await htmlForSettingHost();
      print("Error: $error");
    }

    return true;
  }

  static Future<void> htmlForSettingHost() async {
    try {
      File file = await getHtmlFile();

      await file.writeAsString('''<!DOCTYPE html><html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { height: 70vh; height: 70lvh; display: grid; align-items: center; }
            form { display: grid; gap: 20px; }
            input { padding: 0 10px; width: auto; height: 42px; line-height: 42px; font-size: 24px; }
            button { font-size: 24px; height: 46px; }
          </style>
        </head>
        <body>
          <div>
            <h1>Host not found</h1>
            <form>
              <input type="url" placeholder="http://127.0.0.1" />
              <button>submit</button>
            </form>
          </div>

          <script>
            const form = document.querySelector("form");
            const input = document.querySelector("input");

            form.addEventListener("submit", (e) => {
              e.preventDefault();

              const { value } = input;

              flUpdateHost.postMessage(value);
            });
          </script>
        </body></html>''');
    } catch (error) {
      General.innerDebug("Couldn't create html for for settingup host");
      print("Error: $error");
    }
  }

  static Future<void> syncHtmlTemplate() async {
    General.innerDebug("[syncHtmlTemplate] getting template from $middlewareUrl");

    try {
      await syncMiddlewareHost();
      final response = await http.get(Uri.parse(middlewareUrl));

      General.innerDebug("[syncHtmlTemplate] 1 recieved response");

      String host = "http://${response.body}";

      File hostFile = await getHostFile();
      hostFile.writeAsString(host);

      General.innerDebug("[syncHtmlTemplate] 2 Updating cache for HTML $host");

      await downloadHtml(host);
    } catch(error) {
      General.innerDebug("[syncHtmlTemplate] E Couldn't download from, settingup host form");
      await htmlForSettingHost();
    }
  }
}
