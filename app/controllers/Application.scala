package controllers

import play.api._
import play.api.mvc._
import play.api.data.Form
import play.api.data.Forms._

object Application extends Controller {

  def index = Action { request =>
    Ok(views.html.index(request.remoteAddress))
  }

  def login = Action { implicit request =>
    val from = flash.get("from").getOrElse("")
    val date = flash.get("date").getOrElse("")
    val title = flash.get("title").getOrElse("")
    val entryDate = flash.get("entryDate").getOrElse("")
    Ok(views.html.login(userForm, from, date, title, entryDate))
  }

  def doLogin = Action { implicit request =>
    userForm.bindFromRequest.fold(
      formWithErrors =>
        Ok(views.html.login(formWithErrors, "", "", "", "")),
      user => {
        if (user.name == "Ian" && user.password == "White") {
          Redirect(loginRedirect(user)).withSession {
            session + ("username", user.name)
          }
        }
        else Ok(views.html.login(userForm, user.from, user.date, user.title, user.entryDate))
      }
    )
  }

  def loginRedirect(user: User): Call = {
    user.from match {
      case "listDiaryEntries" => routes.Diaries.listDiaryEntries(user.date, user.title)
      case "diaryEntry" => routes.Diaries.diaryEntry(user.date, user.title, user.entryDate)
      case "spritz" => routes.Diaries.spritz(user.date, user.title, user.entryDate)
      case _ => routes.Application.index
    }
  }

  val userForm = Form(mapping(
    "name" -> nonEmptyText,
    "password" -> nonEmptyText,
    "from" -> text,
    "date" -> text,
    "title" -> text,
    "entryDate" -> text
  )(User.apply)(User.unapply))

}

case class User(name: String, password: String, from: String, date: String, title: String, entryDate: String)