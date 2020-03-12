var stock_price_socket           = new WebSocket( 'ws://localhost:9000/ws' );
    stock_price_socket.onopen    = () => console.log( 'Local websocket opened.' );
    stock_price_socket.onmessage = retrieve_price;

var refresh_timer   = null;
var timer_countdown = 11;

function send_symbol()
{
    stock_price_socket.send( $( '#symbol' ).val().toUpperCase() );
}

function retrieve_price( event )
{
    var stock_data       = JSON.parse( event.data );
    var symbol           = stock_data.symbol.toLowerCase();
    var price            = stock_data.price;

    if( price === null )
        alert( 'Ticker symbol "' + symbol.toUpperCase() + '" is not a public company.' );
    else
    {
        var stock_price_text = symbol.toUpperCase() + ' - $' + price;

        var li_stock       = $( '#li_' + symbol );
        var append_counter = !$( '#stock_prices > li' ).length;

        if( !li_stock.length )
        {
            li_stock = $(
                '<li id="li_' + symbol + '" symbol="' + symbol + '">' +
                    '<span>' + stock_price_text + '</span>' +
                    '&nbsp;' +
                    '<input type="button" value="Remove" onclick="remove_row( this )">' +
                '</li>'
            );

            $( '#stock_prices' ).append( li_stock );
        }
        else
            li_stock.find( 'span' ).text( stock_price_text );

        if( append_counter )
        {
            $( '#refresh_counter' ).append(
                '<p>' +
                    'Refreshing prices in ' +
                    '<span id="refresh_counter_seconds">12</span>' +
                    ' seconds.' +
                '</p>'
            );

            set_refresh_timer();
        }
    }

    $( '#symbol' ).val( '' );
}

function set_refresh_timer()
{
    timer_countdown = 11;

    refresh_timer = setInterval( () => {
        if( timer_countdown <= 0 )
        {
            clearInterval( refresh_timer );
            $( '#refresh_counter_seconds' ).text( 'Refreshing...' );

            $( '#stock_prices > li' ).each(
                ( i, elem ) => stock_price_socket.send( $( elem ).attr( 'symbol' ).toUpperCase() )
            );

            set_refresh_timer();
        }
        else
        {
            $( '#refresh_counter_seconds' ).text( timer_countdown );
        }

        timer_countdown -= 1;
    }, 1000 );
}

function remove_row( elem )
{
    $( elem ).parent().remove();

    if( !$( '#stock_prices > li' ).length )
        $( '#refresh_counter' ).empty();
}