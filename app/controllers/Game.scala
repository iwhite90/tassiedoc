package controllers

import play.api.mvc.{Action, Controller}

/**
 * Created by Ian on 31/10/2014.
 */
object Game extends Controller {

  def start = Action {
    Ok(views.html.game("Your new application is ready."))
  }
}