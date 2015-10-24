package models

import scala.xml.{NodeSeq, XML}

/**
 * Created with IntelliJ IDEA.
 * User: Ian
 * Date: 08/03/14
 * Time: 18:30
 * To change this template use File | Settings | File Templates.
 */
case class Diary(title: String, date: String, entries: Seq[Entry]) {
  val formattedDate: String = {
    val tokens = date.split("-")
    s"${DateUtils.months(tokens(0))} ${tokens(1)}"
  }


}

object Diary {

  val diaries = getDiaries

  def findAllDiaries = diaries

  def findDiaryByDateAndTitle(date: String, title: String): Diary = {
    diaries.filter(diary => diary.date == date && diary.title == title).head
  }

  def findEntry(diary: Diary, entryDate: String): Entry = {
    diary.entries.filter(entry => entry.date == entryDate).head
  }


  def getDiaries: Seq[Diary] = {
    val diaryFiles = List(
      "Australia-1996",
      "Elective-2002",
      "Vienna-2003",
      "Tasmania-2003",
      "Big Holiday-2004",
      "HK-2008",
      "Greece-2008",
      "Malta-2010",
      "Greece-2011",
      "Courchevel-2013",
      "St Lucia-2013",
      "Italy-2013",
	  "Turkey-2014")
    diaryFiles.map { file =>
      val doc = XML.loadFile(s"resources/$file.xml")
      Diary(title = (doc \ "@title").text, date = (doc \ "@date").text, entries = getEntries(doc))
    }
  }

  def getEntries(diary: NodeSeq): Seq[Entry] = {
    (diary \ "entry").map { entry =>
      Entry(date = (entry \ "@date").text, entries = getParagraphs(entry))
    }
  }

  def getParagraphs(entry: NodeSeq): Seq[String] = {
    (entry \ "p").map { p =>
      p.text
    }
  }
}
