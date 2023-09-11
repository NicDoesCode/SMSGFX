/**
 * Provides a bunch of date and time related utility functions.
 */
export default class DateTimelUtil {


    /**
     * Returns a fuzzy date from a date object, based on today's date.
     * If its the same day, it returns the time, if within 5 days then the day name, 
     * if the same year then day + month, if more than a year then short date.
     * @param {Date} date - Date to make fuzzy.
     * @returns {string}
     */
    static getFuzzyDateTime(date) {
        const now = new Date();
        if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            if (DateTimelUtil.isSystem24HTime()) {
                return moment(date).format('H:mm');
            } else {
                return moment(date).format('LT');
            }
        }
        const fiveDaysAgo = moment(now).set({ 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0 }).subtract(5, 'days');
        if (fiveDaysAgo.isBefore(date)) {
            return moment(date).format('ddd');
        }
        if (date.getFullYear() === now.getFullYear()) {
            return moment(date).format('D MMM');
        }
        return moment(date).format('l');
    }


    /**
     * Gets whether the system is using 24h time.
     * @returns {boolean}
     */
    static isSystem24HTime() {
        if (is24h === null) {
            const date = new Date(Date.UTC(2000, 1, 1, 14, 0, 0, 0));
            const dateString = date.toLocaleTimeString();
            is24h = !(/am|pm/.test(dateString.toLowerCase()));
        }
        return is24h;
    }


}

let is24h = null;