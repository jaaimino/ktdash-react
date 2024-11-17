SELECT
  `E`.`eventid` AS `eventid`,
  `E`.`datestamp` AS `datestamp`,
(
    CASE
      concat(`E`.`eventtype`, '|', `E`.`action`)
      WHEN 'page|view' THEN concat(
        IFNULL(
          concat(
            '<a href="/u/',
            `U`.`userid`,
            '">',
            `U`.`username`,
            '</a>'
          ),
          '[Anon]'
        ),
        ' viewed page <a href="',
        `E`.`url`,
        '">',
        `E`.`url`,
        '</a>'
      )
      WHEN 'roster|addop' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> added ',
        `O`.`opname`,
        ' "',
        `RO`.`opname`,
        '" to <a href="/fa/',
        `K`.`factionid`,
        '/kt/',
        `K`.`killteamid`,
        '">',
        `K`.`killteamname`,
        '</a> roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>'
      )
      WHEN 'roster|create' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> created new <a href="/fa/',
        `K`.`factionid`,
        '/kt/',
        `K`.`killteamid`,
        '">',
        `K`.`killteamname`,
        '</a> roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>'
      )
      WHEN 'roster|importv1' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> imported a v1 roster'
      )
      WHEN 'roster|gettext' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> viewed roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
        '\'s text description'
      )
      WHEN 'roster|cloneop' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> cloned a new operative into roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>'
      )
      WHEN 'dashboard|TP' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a>\'s ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
(
          CASE
            WHEN (`E`.`var2` = 1) THEN ' moved to the next TP'
            ELSE ' went back to the previous TP'
          END
        )
      )
      WHEN 'session|signup' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> signed up'
      )
      WHEN 'dashboard|W' THEN concat(
        `RO`.`opname`,
        ' of ',
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a>\'s ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
        ' ',
(
          CASE
            WHEN (`E`.`var2` = 1) THEN 'gained'
            ELSE 'lost'
          END
        ),
        ' 1 Wound'
      )
      WHEN 'dashboard|CP' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a>\'s ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
        ' ',
(
          CASE
            WHEN (`E`.`var2` = 1) THEN 'gained'
            ELSE 'used'
          END
        ),
        ' 1 CP'
      )
      WHEN 'dashboard|VP' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a>\'s ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
        ' ',
(
          CASE
            WHEN (`E`.`var2` = 1) THEN 'gained'
            ELSE 'lost'
          END
        ),
        ' 1 VP'
      )
      WHEN 'dashboard|RP' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a>\'s ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>',
        ' ',
(
          CASE
            WHEN (`E`.`var2` = 1) THEN 'gained'
            ELSE 'lost'
          END
        ),
        ' 1 RP'
      )
      WHEN 'roster|print' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> printed their "',
(
          CASE
            `E`.`label`
            WHEN 'roster' THEN `R`.`rostername`
            ELSE `RO`.`opname`
          END
        ),
(
          CASE
            `E`.`label`
            WHEN 'roster' THEN '" roster'
            ELSE '" operative'
          END
        )
      )
      WHEN 'roster|opportrait' THEN concat(
        '<a href="/u/',
        `U`.`userid`,
        '">',
        `U`.`username`,
        '</a> added a new ',
(
          CASE
            WHEN (`E`.`label` = 'custom') THEN 'custom'
            ELSE 'default'
          END
        ),
        ' portrait for "',
        `RO`.`opname`,
        '" of ',
        ' roster <a href="/r/',
        `R`.`rosterid`,
        '">',
        `R`.`rostername`,
        '</a>'
      )
      ELSE ''
    END
  ) AS `ActionLog`,
  `E`.`userid` AS `userid`,
  `E`.`userip` AS `userip`,
  `E`.`eventtype` AS `eventtype`,
  `E`.`action` AS `action`,
  `E`.`label` AS `label`,
  `E`.`var1` AS `var1`,
  `E`.`var2` AS `var2`,
  `E`.`var3` AS `var3`,
  `U`.`username` AS `username`,
  `R`.`rostername` AS `rostername`,
  `RO`.`opname` AS `opname`,
  `O`.`opname` AS `optype`
FROM
  (
    (
      (
        (
          (
            `killteam`.`Event` `E`
            LEFT JOIN `killteam`.`User` `U` ON((`U`.`userid` = `E`.`userid`))
          )
          LEFT JOIN `killteam`.`Roster` `R` ON((`R`.`rosterid` = `E`.`var1`))
        )
        LEFT JOIN `killteam`.`Killteam` `K` ON(
          (
            (`K`.`factionid` = `R`.`factionid`)
            AND (`K`.`killteamid` = `R`.`killteamid`)
          )
        )
      )
      LEFT JOIN `killteam`.`RosterOperative` `RO` ON(
        (
          (`RO`.`rosterid` = `E`.`var1`)
          AND (`RO`.`rosteropid` = `E`.`var2`)
        )
      )
    )
    LEFT JOIN `killteam`.`Operative` `O` ON(
      (
        (`O`.`factionid` = `RO`.`factionid`)
        AND (`O`.`killteamid` = `RO`.`killteamid`)
        AND (`O`.`fireteamid` = `RO`.`fireteamid`)
        AND (`O`.`opid` = `RO`.`opid`)
      )
    )
  )
WHERE
  (
    (
      `E`.`eventtype` NOT IN ('compendium', 'pwa', 'opname')
    )
    AND (
      concat(`E`.`eventtype`, '|', `E`.`action`) NOT IN (
        'dashboard|selectroster',
        'dashboard|reset',
        'settings|view',
        'roster|edit',
        'settings|set',
        'session|login',
        'roster|view',
        'roster|editop',
        'roster|delop',
        'dashboard|init',
        'rosters|view',
        'roster|killteamcomp',
        'roster|delete',
        'roster|gallery'
      )
    )
  )
ORDER BY
  `E`.`eventid` DESC