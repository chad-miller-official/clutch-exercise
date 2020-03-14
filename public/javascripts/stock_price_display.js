'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RefreshCounter = function (_React$Component) {
  _inherits(RefreshCounter, _React$Component);

  function RefreshCounter(props) {
    _classCallCheck(this, RefreshCounter);

    var _this = _possibleConstructorReturn(this, (RefreshCounter.__proto__ || Object.getPrototypeOf(RefreshCounter)).call(this, props));

    _this.state = { seconds: 10 };
    return _this;
  }

  _createClass(RefreshCounter, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.timer = setInterval(function () {
        if (_this2.state.seconds <= 0) {
          _this2.props.onZero();
          _this2.setState({ seconds: 10 });
        } else {
          _this2.setState({ seconds: _this2.state.seconds - 1 });
        }
      }, 1000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.timer);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.seconds <= 0) return React.createElement(
        'p',
        null,
        'Refreshing...'
      );

      return React.createElement(
        'p',
        null,
        'Refreshing prices in ',
        this.state.seconds,
        ' seconds.'
      );
    }
  }]);

  return RefreshCounter;
}(React.Component);

var StockPriceDisplay = function (_React$Component2) {
  _inherits(StockPriceDisplay, _React$Component2);

  function StockPriceDisplay(props) {
    _classCallCheck(this, StockPriceDisplay);

    var _this3 = _possibleConstructorReturn(this, (StockPriceDisplay.__proto__ || Object.getPrototypeOf(StockPriceDisplay)).call(this, props));

    _this3.sendSymbol = _this3.sendSymbol.bind(_this3);
    _this3.refreshPrices = _this3.refreshPrices.bind(_this3);

    var stockPriceSocket = new WebSocket('ws://localhost:9000/ws');
    stockPriceSocket.onopen = function () {
      return console.log('Local websocket opened.');
    };
    stockPriceSocket.onmessage = function (e) {
      return _this3.retrievePrice(e);
    };

    _this3.props.stockPriceSocket = stockPriceSocket;

    _this3.state = {
      companies: [],
      symbols: {}
    };
    return _this3;
  }

  _createClass(StockPriceDisplay, [{
    key: 'sendSymbol',
    value: function sendSymbol(event) {
      this.props.stockPriceSocket.send(document.querySelector('#symbol').value.toUpperCase());
      document.querySelector('#symbol').value = '';
    }
  }, {
    key: 'refreshPrices',
    value: function refreshPrices() {
      var _this4 = this;

      Object.keys(this.state.symbols).forEach(function (symbol) {
        return _this4.props.stockPriceSocket.send(symbol);
      });
    }
  }, {
    key: 'retrievePrice',
    value: function retrievePrice(event) {
      var stock_data = JSON.parse(event.data);
      var symbol = stock_data.symbol.toUpperCase();
      var price = stock_data.price;

      if (price === null) alert('Ticker symbol "' + symbol + '" is not a public company.');else if (!(symbol in this.state.symbols)) {
        this.setState({
          companies: this.state.companies.concat([{ symbol: symbol, price: price }]),
          symbols: Object.assign({}, this.state.symbols, _defineProperty({}, symbol, true))
        });
      }
    }
  }, {
    key: 'removeCompany',
    value: function removeCompany(companiesIndex, symbol) {
      var newCompanies = JSON.parse(JSON.stringify(this.state.companies));
      newCompanies.splice(companiesIndex, 1);

      var newSymbols = JSON.parse(JSON.stringify(this.state.symbols));
      delete newSymbols[symbol];

      this.setState({
        companies: newCompanies,
        symbols: newSymbols
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var stockItems = this.state.companies.map(function (company, index) {
        return React.createElement(
          'li',
          null,
          React.createElement(
            'span',
            null,
            company.symbol,
            ' - $',
            company.price
          ),
          '\xA0',
          React.createElement('input', { type: 'button', value: 'Remove', onClick: _this5.removeCompany.bind(_this5, index, company.symbol) })
        );
      });

      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          React.createElement(
            'label',
            { 'for': 'symbol' },
            'Ticker Symbol:'
          ),
          '\xA0',
          React.createElement('input', { type: 'text', id: 'symbol', name: 'symbol' }),
          '\xA0',
          React.createElement('input', { type: 'button', value: 'Get Price', onClick: this.sendSymbol })
        ),
        React.createElement(
          'div',
          null,
          this.state.companies.length > 0 ? React.createElement(RefreshCounter, { onZero: this.refreshPrices }) : '',
          React.createElement(
            'ul',
            null,
            stockItems
          )
        )
      );
    }
  }]);

  return StockPriceDisplay;
}(React.Component);

ReactDOM.render(React.createElement(StockPriceDisplay), document.querySelector('#stock_price_display_container'));