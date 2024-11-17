SELECT
  `R`.`userid` AS `userid`,
  `U`.`username` AS `username`,
  `R`.`rosterid` AS `rosterid`,
  `R`.`seq` AS `seq`,
  `R`.`rostername` AS `rostername`,
  `R`.`notes` AS `notes`,
  `R`.`factionid` AS `factionid`,
  `R`.`killteamid` AS `killteamid`,
  `R`.`hascustomportrait` AS `hascustomportrait`,
  `R`.`keyword` AS `keyword`,
  `R`.`portraitcopyok` AS `portraitcopyok`,
  `R`.`eqids` AS `eqids`,
  `R`.`TP` AS `TP`,
  `R`.`CP` AS `CP`,
  `R`.`VP` AS `VP`,
  `R`.`RP` AS `RP`,
  `R`.`ployids` AS `ployids`,
  `R`.`tacopids` AS `tacopids`,
  `R`.`spotlight` AS `spotlight`,
  `F`.`factionname` AS `factionname`,
  `K`.`killteamname` AS `killteamname`,
  `K`.`edition` AS `edition`,
  `K`.`customkeyword` AS `killteamcustomkeyword`,
  `K`.`description` AS `killteamdescription`,
  GROUP_CONCAT(
    DISTINCT `O`.`opname`
    ORDER BY
      `RO`.`seq` ASC SEPARATOR ', '
  ) AS `oplist`,
  `R`.`viewcount` AS `viewcount`,
  `R`.`importcount` AS `importcount`,
  `R`.`reqpts` AS `reqpts`,
  `R`.`stratnotes` AS `stratnotes`,
  `R`.`eqnotes` AS `eqnotes`,
  `R`.`specopnotes` AS `specopnotes`
FROM
  (
    (
      (
        (
          (
            `killteam`.`Roster` `R`
            JOIN `killteam`.`User` `U` ON((`U`.`userid` = `R`.`userid`))
          )
          LEFT JOIN `killteam`.`Faction` `F` ON((`F`.`factionid` = `R`.`factionid`))
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
          (`RO`.`userid` = `R`.`userid`)
          AND (`RO`.`rosterid` = `R`.`rosterid`)
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
GROUP BY
  `R`.`userid`,
  `U`.`username`,
  `R`.`rosterid`,
  `R`.`seq`,
  `R`.`rostername`,
  `R`.`factionid`,
  `R`.`killteamid`,
  `R`.`hascustomportrait`,
  `R`.`eqids`,
  `R`.`TP`,
  `R`.`CP`,
  `R`.`VP`,
  `R`.`RP`,
  `R`.`ployids`,
  `R`.`tacopids`,
  `R`.`spotlight`,
  `F`.`factionname`,
  `K`.`killteamname`,
  `K`.`edition`,
  `K`.`description`