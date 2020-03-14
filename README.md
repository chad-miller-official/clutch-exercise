# Clutch Stock Price Exercise

This is an extremely barebones stock price web app written in:
* Scala using the Play framework, for the server
* React.js, for the client

What you can do:
* Add ticker symbols to a list
* Remove ticker symbols from a list
* Watch stock prices on the list get updated every 10 seconds via websockets

What you cannot do:
* Everything not mentioned in the above list

## How to Run (on Ubuntu)

This web app was tested locally on Ubuntu 18.04, OpenJDK version 11, and sbt version 1.3.8.

1. Ensure OpenJDK is installed on your machine. If it is not, run `sudo apt update && sudo apt install default-jdk`.
2. Ensure sbt is installed on your machine. If it is not, run the following commands:
```
echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt-get update
sudo apt-get install sbt
```
3. Within the root directory of this repository, run `sbt run`.
4. Navigate to `http://localhost:9000/`. You should be greeted with a tiny UI allowing you to enter a ticker symbol into the input box. To ensure everything is working as expected, enter a symbol, such as AAPL or GOOG. The symbol and its price should be appended to a list underneath the input box, and a countdown timer to the next price refresh should also appear underneath the input box.
