package models

/**
 * Created with IntelliJ IDEA.
 * User: Ian
 * Date: 08/03/14
 * Time: 18:30
 * To change this template use File | Settings | File Templates.
 */
case class Entry(date: String, entries: Seq[String]) {

  val formattedDate: String = {
    val tokens = date.split("-")
    s"${DateUtils.days(tokens(0))} ${DateUtils.months(tokens(1))} ${tokens(2)}"
  }
}
