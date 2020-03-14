import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  TextField,
  Typography
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';

function SymbolLookup(props) {
  return (
    <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
      <Grid item>
        <TextField variant="outlined" id="symbol" label="Ticker Symbol" />
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" size="large" onClick={props.onClick}>
          Get Price
        </Button>
      </Grid>
    </Grid>
  );
}

class RefreshCounter extends Component {
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
    let text = '';

    if(this.state.seconds <= 0)
      text = 'Refreshing...';
    else {
      let plural = 's';

      if(this.state.seconds == 1)
        plural = '';

      text = 'Refreshing prices in ' + this.state.seconds + ' second' + plural + '.';
    }

    return <ListSubheader>{text}</ListSubheader>;
  }
}

function PriceList(props) {
  const stockItems = props.companies.map((company, index) =>
    <ListItem>
      <ListItemText primary={company.symbol + ' - $' + company.price} />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => props.onRemoveClick(index, company.symbol)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <List subheader={props.refreshCounter}>
      <Divider />
      {stockItems}
    </List>
  );
}

class StockPriceDisplay extends Component {
  constructor(props) {
    super(props);

    this.sendSymbol = this.sendSymbol.bind(this);
    this.refreshPrices = this.refreshPrices.bind(this);
    this.removeCompany = this.removeCompany.bind(this);

    const stockPriceSocket = new WebSocket('ws://localhost:9000/ws');
    stockPriceSocket.onopen = () => console.log('Local websocket opened.');
    stockPriceSocket.onmessage = (e) => this.retrievePrice(e);

    this.props.stockPriceSocket = stockPriceSocket;

    this.state = {
        companies: [],
        symbols: {},
    };
  }

  sendSymbol(event) {
    let symbolInput = document.getElementById('symbol');
    this.props.stockPriceSocket.send(symbolInput.value.toUpperCase());
    symbolInput.value = '';
  }

  refreshPrices() {
    Object.keys(this.state.symbols).forEach((symbol) => this.props.stockPriceSocket.send(symbol));
  }

  retrievePrice(event) {
    const stock_data = JSON.parse( event.data );
    const symbol = stock_data.symbol.toUpperCase();
    const price  = stock_data.price;

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
    let priceList = '';

    if(this.state.companies.length > 0) {
      priceList = (
        <PriceList refreshCounter={<RefreshCounter onZero={this.refreshPrices} />}
                   companies={this.state.companies}
                   onRemoveClick={this.removeCompany} />
      );
    } else {
      priceList = (
        <List subheader={<ListSubheader>Enter a stock symbol above.</ListSubheader>}>
          <Divider />
        </List>
      );
    }

    return (
      <Grid container direction="column">
        <Grid item>
          <SymbolLookup onClick={this.sendSymbol} />
        </Grid>
        <Grid item>
          {priceList}
        </Grid>
      </Grid>
    )
  }
}

export default StockPriceDisplay;

const wrapper = document.getElementById('stock_price_display_container');

if(wrapper)
  ReactDOM.render(React.createElement(StockPriceDisplay), wrapper);
else
  console.log('Wrapper container is missing!');
