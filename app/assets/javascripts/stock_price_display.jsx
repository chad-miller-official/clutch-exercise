'use strict';

class RefreshCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 10 };
  }

  componentDidMount() {
    this.timer = setInterval(
      () => {
        if(this.state.seconds <= 0) {
          this.props.onZero();
          this.setState({ seconds: 10 });
        } else {
          this.setState({ seconds: this.state.seconds - 1 });
        }
      },
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    if(this.state.seconds <= 0)
      return <p>Refreshing...</p>;

    return <p>Refreshing prices in {this.state.seconds} seconds.</p>;
  }
}

class StockPriceDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.sendSymbol = this.sendSymbol.bind(this);
    this.refreshPrices = this.refreshPrices.bind(this);

    let stockPriceSocket = new WebSocket('ws://localhost:9000/ws');
    stockPriceSocket.onopen = () => console.log('Local websocket opened.');
    stockPriceSocket.onmessage = (e) => this.retrievePrice(e);

    this.props.stockPriceSocket = stockPriceSocket;

    this.state = {
        companies: [],
        symbols: {},
    };
  }

  sendSymbol(event) {
    this.props.stockPriceSocket.send(document.querySelector('#symbol').value.toUpperCase());
    document.querySelector('#symbol').value = '';
  }

  refreshPrices() {
    Object.keys(this.state.symbols).forEach((symbol) => this.props.stockPriceSocket.send(symbol));
  }

  retrievePrice(event) {
    let stock_data = JSON.parse( event.data );
    let symbol = stock_data.symbol.toUpperCase();
    let price  = stock_data.price;

    if( price === null )
      alert('Ticker symbol "' + symbol + '" is not a public company.');
    else if(!(symbol in this.state.symbols)) {
      this.setState({
          companies: this.state.companies.concat([{ symbol, price }]),
          symbols: Object.assign({}, this.state.symbols, { [symbol]: true }),
      });
    }
  }

  removeCompany(companiesIndex, symbol) {
    let newCompanies = JSON.parse(JSON.stringify(this.state.companies));
    newCompanies.splice(companiesIndex, 1);

    let newSymbols = JSON.parse(JSON.stringify(this.state.symbols));
    delete newSymbols[symbol];

    this.setState({
      companies: newCompanies,
      symbols: newSymbols,
    });
  }

  render() {
    const stockItems = this.state.companies.map((company, index) =>
      <li>
        <span>{company.symbol} - ${company.price}</span>
        &nbsp;
        <input type="button" value="Remove" onClick={this.removeCompany.bind(this, index, company.symbol)} />
      </li>
    );

    return (
      <div>
        <p>
          <label for="symbol">Ticker Symbol:</label>
          &nbsp;
          <input type="text" id="symbol" name="symbol" />
          &nbsp;
          <input type="button" value="Get Price" onClick={this.sendSymbol} />
        </p>
        <div>
          {this.state.companies.length > 0
              ? <RefreshCounter onZero={this.refreshPrices} />
              : ''}
          <ul>
            {stockItems}
          </ul>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  React.createElement(StockPriceDisplay),
  document.querySelector('#stock_price_display_container')
);
