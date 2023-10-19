/**
 *  @class
 *  @function CountdownTimer
 */

if (!customElements.get('countdown-timer')) {
  class CountdownTimer extends HTMLElement {
    constructor() {
      super();

      this.repeatCycle = this.dataset.repeatcycle;

      const date = this.dataset.date.split('-');

      const day = parseInt(date[0]);
      const month = parseInt(date[1]);
      const year = parseInt(date[2]);

      const guessTimezone = dayjs.tz.guess();
      const timezone = dayjs().tz(guessTimezone).format('Z');

      let time = this.dataset.time;
      let hour;
      let min;

      if (time != null) {
        time = time.split(':');
        hour = parseInt(time[0]);
        min = parseInt(time[1]);
      }

      let date_string = `${month}/${day}/${year} ${hour}:${min} GMT${timezone}`;

      this.countDownDate = new Date(
        year,
        month - 1,
        day,
        hour,
        min,
        0,
        0
      ).getTime();
      this.countDownDate = new Date(date_string).getTime();

      let startDate = dayjs(date_string);
      let currentDate = dayjs().tz(guessTimezone);

      const dayDiff = currentDate.diff(startDate, 'days');
      const weekDiff = currentDate.diff(startDate, 'week');

      const monthsValues = [];

      if (startDate.month() < currentDate.month()) {
        let interimPeriod = startDate.clone();
        while (interimPeriod.month() < currentDate.month()) {
          monthsValues.push(dayjs(interimPeriod).daysInMonth());
          interimPeriod = interimPeriod.add(1, 'month');
        }
      }

      const sumMonthValues = monthsValues.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0
      );

      const overSumMonthValues = monthsValues
        .slice(0, -1)
        .reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue,
          0
        );

      const lastWeekUpdate = currentDate.subtract(
        dayDiff - weekDiff * 7,
        'days'
      );

      const recycle = cycle => {
        switch (cycle) {
          case 'Week':
            return {
              updatedDate: dayjs(lastWeekUpdate).add(1, 'w')
            };
          case 'Month':
            return {
              updatedDate:
                sumMonthValues <= dayDiff
                  ? startDate.add(sumMonthValues, 'days').add(1, 'M')
                  : startDate
                      .add(overSumMonthValues + 1, 'days')
                      .add(1, 'M')
            };
        }
      };

      let date_string_restart = `${recycle(
        this.repeatCycle
      ).updatedDate.format(
        'M/D/YYYY'
      )} ${hour}:${min} GMT${timezone}`;

      this.countDownDateRestart = new Date(
        date_string_restart
      ).getTime();
    }

    convertDateForIos(date) {
      var arr = date.split(/[- :]/);
      date = new Date(
        arr[0],
        arr[1] - 1,
        arr[2],
        arr[3],
        arr[4],
        arr[5]
      );
      return date;
    }

    connectedCallback() {
      let _this = this;

      const restart = this.dataset.restart;
      const shopLocale = this.dataset.locale;

      const updateTime = function () {
        const now = new Date().getTime();
        const distance = _this.countDownDate - now;
        const distanceRestart = _this.countDownDateRestart - now;

        const dayCaption = _this.querySelector(
          '.days .countdown-timer__date-caption'
        ).dataset.day;

        const daysCaption = _this.querySelector(
          '.days .countdown-timer__date-caption'
        ).dataset.days;

        const hourCaption = _this.querySelector(
          '.hours .countdown-timer__date-caption'
        ).dataset.hour;

        const hoursCaption = _this.querySelector(
          '.hours .countdown-timer__date-caption'
        ).dataset.hours;

        const minuteCaption = _this.querySelector(
          '.minutes .countdown-timer__date-caption'
        ).dataset.minute;

        const minutesCaption = _this.querySelector(
          '.minutes .countdown-timer__date-caption'
        ).dataset.minutes;

        const daysCount = range =>
          Math.floor(range / (1000 * 60 * 60 * 24));

        const days = daysCount(distance);
        const daysRestart = daysCount(distanceRestart);

        const hoursCount = range =>
          Math.floor(
            (range % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );

        const hours = hoursCount(distance);
        const hoursRestart = hoursCount(distanceRestart);

        const minutesCount = range =>
          Math.floor((range % (1000 * 60 * 60)) / (1000 * 60));

        const minutes = minutesCount(distance);
        const minutesRestart = minutesCount(distanceRestart);

        const secondsCount = range =>
          Math.floor((range % (1000 * 60)) / 1000);

        const seconds = secondsCount(distance);
        const secondsRestart = secondsCount(distanceRestart);

        if (distance < 0 && restart === 'false') {
          _this.querySelector(
            '.days .countdown-timer__date-header'
          ).innerHTML = 0;
          _this.querySelector(
            '.hours .countdown-timer__date-header'
          ).innerHTML = 0;
          _this.querySelector(
            '.minutes .countdown-timer__date-header'
          ).innerHTML = 0;
          _this.querySelector(
            '.seconds .countdown-timer__date-header'
          ).innerHTML = 0;
        } else if (distance < 0 && restart === 'true') {
          requestAnimationFrame(updateTime);
          _this.querySelector(
            '.days .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(daysRestart);
          _this.querySelector(
            '.hours .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(hoursRestart);
          _this.querySelector(
            '.minutes .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(minutesRestart);
          _this.querySelector(
            '.seconds .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(secondsRestart);

          const changeSingularToPlural = (
            dateUnit,
            singular,
            plural,
            dateClassName
          ) => {
            shopLocale === 'en' && dateUnit === 1
              ? (_this.querySelector(
                  `.${dateClassName} .countdown-timer__date-caption`
                ).innerHTML = CountdownTimer.addSingular(singular))
              : (_this.querySelector(
                  `.${dateClassName} .countdown-timer__date-caption`
                ).innerHTML = CountdownTimer.addSingular(plural));
          };

          changeSingularToPlural(
            daysRestart,
            dayCaption,
            daysCaption,
            'days'
          );
          changeSingularToPlural(
            hoursRestart,
            hourCaption,
            hoursCaption,
            'hours'
          );
          changeSingularToPlural(
            minutesRestart,
            minuteCaption,
            minutesCaption,
            'minutes'
          );
        } else {
          requestAnimationFrame(updateTime);
          _this.querySelector(
            '.days .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(days);
          _this.querySelector(
            '.hours .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(hours);
          _this.querySelector(
            '.minutes .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(minutes);
          _this.querySelector(
            '.seconds .countdown-timer__date-header'
          ).innerHTML = CountdownTimer.addZero(seconds);

          const changeSingularToPlural = (
            dateUnit,
            singular,
            plural,
            dateClassName
          ) => {
            shopLocale === 'en' && dateUnit === 1
              ? (_this.querySelector(
                  `.${dateClassName} .countdown-timer__date-caption`
                ).innerHTML = CountdownTimer.addSingular(singular))
              : (_this.querySelector(
                  `.${dateClassName} .countdown-timer__date-caption`
                ).innerHTML = CountdownTimer.addSingular(plural));
          };

          changeSingularToPlural(
            days,
            dayCaption,
            daysCaption,
            'days'
          );
          changeSingularToPlural(
            hours,
            hourCaption,
            hoursCaption,
            'hours'
          );
          changeSingularToPlural(
            minutes,
            minuteCaption,
            minutesCaption,
            'minutes'
          );
        }
      };
      requestAnimationFrame(updateTime);
    }
    static addZero(x) {
      return x < 10 && x >= 0 ? '0' + x : x;
    }
    static addSingular(x) {
      return x;
    }
  }
  customElements.define('countdown-timer', CountdownTimer);
}
