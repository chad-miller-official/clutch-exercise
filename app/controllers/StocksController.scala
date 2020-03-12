package controllers

import akka.actor._
import akka.stream.Materializer
import javax.inject._
import play.api._
import play.api.libs.json._
import play.api.libs.streams.ActorFlow
import play.api.mvc._
import scala.collection.JavaConverters._
import yahoofinance.YahooFinance

object StocksWebSocketActor {
  def props(out: ActorRef) = Props(new StocksWebSocketActor(out))
}

class StocksWebSocketActor(out: ActorRef) extends Actor {
  def getPrice(symbol: String): Option[String] = {
    try {
      Some("%.2f".format(YahooFinance.get(symbol).getQuote.getPrice.doubleValue))
    } catch {
      // XXX very hacky. If a NullPointerException was thrown, assume the call
      // to YahooFinance.get() returned null and return None. Other errors may
      // be thrown, but I was not able to encounter any while implementing the
      // solution to this coding exam. In a production environment, I would
      // implement far better error handling.
      case ex: NullPointerException => None
    }
  }

  def receive = {
    case symbol: String =>
      out ! JsObject(Seq(
        "symbol" -> JsString(symbol),
        "price" -> (getPrice(symbol) match {
          case Some(price) => JsString(price)
          case None => JsNull
        })
      )).toString
  }
}

@Singleton
class StocksController @Inject()(val controllerComponents: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends BaseController {
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.stocks())
  }

  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      StocksWebSocketActor.props(out)
    }
  }
}
