package controllers

import play.api.mvc.{Action, Controller}
import models.Diary

/**
 * Created with IntelliJ IDEA.
 * User: Ian
 * Date: 08/03/14
 * Time: 18:38
 * To change this template use File | Settings | File Templates.
 */
object Diaries extends Controller {

  def listDiaries = Action { implicit request =>
    val diaries = Diary.findAllDiaries
    Ok(views.html.Diaries.diaries(diaries))
  }

  def listDiaryEntries(date: String, title: String) = Action { implicit request =>
    session.get("username").map { user =>
      val diary = Diary.findDiaryByDateAndTitle(date, title)
      Ok(views.html.Diaries.entries(diary))
    }.getOrElse {
      Redirect(routes.Application.login).flashing(
        "from" -> "listDiaryEntries",
        "date" -> date,
        "title" -> title
      )
    }
  }

  def diaryEntry(date: String, title: String, entryDate: String) = Action { implicit request =>
    session.get("username").map { user =>
      val diary = Diary.findDiaryByDateAndTitle(date, title)
      val entry = Diary.findEntry(diary, entryDate)
      Ok(views.html.Diaries.entry(diary.title, diary.date, entry))
    }.getOrElse {
      Redirect(routes.Application.login).flashing(
        "from" -> "diaryEntry",
        "date" -> date,
        "title" -> title,
        "entryDate" -> entryDate
      )
    }

  }


  def spritz(date: String, title: String, entryDate: String) = Action { implicit request =>
    session.get("username").map { user =>
      val diary = Diary.findDiaryByDateAndTitle(date, title)
      val entry = Diary.findEntry(diary, entryDate)
      Ok(views.html.Diaries.spritzEntry(diary.title, entry))
    }.getOrElse {
      Redirect(routes.Application.login).flashing(
        "from" -> "spritz",
        "date" -> date,
        "title" -> title,
        "entryDate" -> entryDate
      )
    }
  }
}
