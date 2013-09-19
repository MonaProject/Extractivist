# -*- coding: utf-8 -*-

import time as time_module
from datetime import datetime

class Chronos:
  months = [None, 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']

  # 12 -> 12, 2 -> 02
  @staticmethod
  def intfix(integer):
    if int(integer) < 10 and not str(integer)[0] == '0':
      return str('0' + str(integer))
    return str(integer)


  #
  @staticmethod
  def m_days(month, year):
    days = [None, 31, None, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    if str(month) != '02' and str(month) != '2':
      return str(days[int(month)])
    else:
      if Chronos.is_leap_year(year):
        return str(29)
      else:
        return str(28)


  #
  @staticmethod
  def is_leap_year(year):
    if int(year) % 400 == 0:
        return True
    if int(year) % 100 == 0:
        return False
    if int(year) % 4 == 0:
        return True
    else:
        return False


  # Interprets a time and returns a human-friendly representation, and 2 numbers
  # indicating the start and end of the time period (yyyymmddhhmmss)
  @staticmethod
  def interpret_time(time):

    type = 'FAIL'
    pretty_time = 'FAIL'
    start       = '-1'
    finish      = '-1'
    
    # 1969, 2012
    if len(time) == 4 and time.isdigit():
      type        = 'year'
      pretty_time = time
      start       = str(time) + '0101000000'
      finish      = str(time) + '1231235959'

    # 197X, 20XX
    elif len(time) == 4 and 'X' in time:
      type        = 'decade'
      pretty_time = str(time.replace('X', '0')) + '-' + str(time.replace('X', '9'))
      start       = str(time.replace('X', '0')) + '0101000000'
      finish      = str(time.replace('X', '9')) + '1231235959'

    # 2000/2007
    elif '/' in time:
      type        = 'year period'
      pretty_time = time.replace('/', '-')
      start       = str(time.split('/')[0]) + '0101000000'
      finish      = str(time.split('/')[1]) + '1231235959'

    # 2013-02, 2012-WI, 2011-06-14-TNI, 2013-Q3, 2013-W01-WE
    elif time[:4].isdigit():
      split_time = time.split('-')
      
      # 2013-02
      if len(split_time) == 2 and split_time[1].isdigit():
        type        = 'month'
        pretty_time = Chronos.months[int(split_time[1])] + ' ' + str(split_time[0])
        start       = str(split_time[0]) + Chronos.intfix(split_time[1]) + '01000000'
        finish      = str(split_time[0]) + Chronos.intfix(split_time[1]) + Chronos.m_days(split_time[1], split_time[0]) + '235959'
      
      # 2012-WI
      elif split_time[1] == 'SP' or split_time[1] == 'SU' or \
           split_time[1] == 'FA' or split_time[1] == 'WI':
        season_names = {'SP': 'spring', 'SU': 'summer', 'FA': 'fall', 'WI': 'winter'}
        season_dkeys = {'SP': 0, 'SU': 1, 'FA': 2, 'WI': 3}
        season_dates = ['0321', '0621', '0923', '1223']

        type        = 'season'
        pretty_time = season_names[split_time[1]] + ' of ' + str(split_time[0])
        if split_time[1] == 'WI':
          split_time[0] = int(split_time[0]) - 1
        start       = str(split_time[0]) + season_dates[season_dkeys[split_time[1]]] + '000000'
        if split_time[1] == 'WI':
          split_time[0] = int(split_time[0]) + 1
        finish      = str(split_time[0]) + season_dates[(season_dkeys[split_time[1]] + 1) % 4] + '235959'

      # 2013-Q3
      elif 'Q' in split_time[1]:
        type        = 'quarter'
        pretty_time = str(split_time[1]) + ' ' + str(split_time[0])
        start       = str(split_time[0]) + Chronos.intfix((int(str(split_time[1])[1]) - 1) * 3 + 1) + '01000000'
        finish      = str(split_time[0]) + Chronos.intfix((int(str(split_time[1])[1])) * 3) + Chronos.m_days(Chronos.intfix((int(str(split_time[1])[1])) * 3), split_time[0]) + '235959'
      
      # 2013-W3
      elif 'W' in split_time[1] and not 'X' in split_time[1]:
        type        = 'week'
        pretty_time = 'Week ' + str(split_time[1][1:]) + ' of ' + str(split_time[0])
        start       = time_module.strptime(str(split_time[0]) + ' ' + str(int(split_time[1][1:]) - 1) + ' 1', '%Y %W %w')
        start       = str(start[0]) + Chronos.intfix(start[1]) + Chronos.intfix(start[2]) + '000000'
        finish      = time_module.strptime(str(split_time[0]) + ' ' + str(int(split_time[1][1:]) - 1) + ' 0', '%Y %W %w')
        finish      = str(finish[0]) + Chronos.intfix(finish[1]) + Chronos.intfix(finish[2]) + '235959'

      # 2011-06-014TNI, 2012-02-05T02:24
      elif len(split_time) > 2:
        # 2012-04-01
        if not 'T' in time and not 'W' in time:
          type        = 'day'
          pretty_time = str(int(split_time[2])) + ' ' + Chronos.months[int(split_time[1])] + ' ' + str(split_time[0])
          start       = str(split_time[0]) + str(split_time[1]) + str(split_time[2]) + '000000'
          finish      = str(split_time[0]) + str(split_time[1]) + str(split_time[2]) + '235959'
        
        # 2012-04-01T13:37
        elif 'T' in time and ':' in time and not 'X' in time:
          split_time2 = split_time[2].split('T')
          split_time3 = split_time2[1].split(':')
          
          # pretty_time = time.replace('T', ' ')
          type        = 'time'
          pretty_time = str(int(split_time2[0])) + ' ' + Chronos.months[int(split_time[1])] + ' ' + str(split_time[0]) + ' at ' + split_time2[1]
          start       = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + str(split_time3[0]) + str(split_time3[1]) + '00'
          finish      = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + str(split_time3[0]) + str(split_time3[1]) + '59'
        
        # 2013-04-14TXX
        elif 'T' in time and 'X' in time:
          split_time2 = split_time[2].split('T')

          type        = 'day'
          pretty_time = str(int(split_time2[0])) + ' ' + Chronos.months[int(split_time[1])] + ' ' + str(split_time[0])
          start       = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + '000000'
          finish      = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + '235959'

        # 2013-04-21TMO
        elif time[-2:] == 'MO' or time[-2:] == 'AF' or time[-2:] == 'EV' or time[-2:] == 'NI':
          period_names = {'MO': 'morning', 'AF': 'afternoon', 'EV': 'evening', 'NI': 'night'}
          period_dkeys = {'MO': 0, 'AF': 1, 'EV': 2, 'NI': 3}
          period_times = ['00', '06', '12', '18']
          period_times2 = ['23', '05', '11', '17']
          split_time2 = split_time[2].split('T')
        
          type        = 'time of day'
          pretty_time = period_names[time[-2:]] + ' of ' + str(int(split_time2[0])) + ' ' + Chronos.months[int(split_time[1])] + ' ' + str(split_time[0])
          start       = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + period_times[period_dkeys[time[-2:]]] + '0000'
          finish      = str(split_time[0]) + str(split_time[1]) + str(split_time2[0]) + period_times2[(period_dkeys[time[-2:]] + 1) % 4] + '5959'

    # 1-1-1970, 5-12-2004
    elif time[-4:].isdigit():
      split_time = time.split('-')
      
      type        = 'day'
      pretty_time = str(split_time[0]) + ' ' + Chronos.months[int(split_time[1])] + ' ' + str(split_time[2])
      start       = str(split_time[2]) + Chronos.intfix(split_time[1]) + Chronos.intfix(split_time[0]) + '000000'
      finish      = str(split_time[2]) + Chronos.intfix(split_time[1]) + Chronos.intfix(split_time[0]) + '235959'

    return type, pretty_time, start, finish
















