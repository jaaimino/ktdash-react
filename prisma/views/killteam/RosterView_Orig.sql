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
  `R`.`TP` AS `TP`,
  `R`.`CP` AS `CP`,
  `R`.`VP` AS `VP`,
  `R`.`RP` AS `RP`,
  `R`.`ployids` AS `ployids`,
  `R`.`tacopids` AS `tacopids`,
  `R`.`spotlight` AS `spotlight`,
  `F`.`factionname` AS `factionname`,
  `K`.`killteamname` AS `killteamname`,
  `K`.`description` AS `killteamdescription`,
  GROUP_CONCAT(
    DISTINCT (
      CASE
        `RO`.`opcount`
        WHEN 1 THEN `RO`.`optype`
        ELSE concat(`RO`.`opcount`, ' ', `RO`.`optype`)
      END
    )
    ORDER BY
      `RO`.`firstseq` ASC SEPARATOR ', '
  ) AS `oplist`,
  `R`.`viewcount` AS `viewcount`,
  `R`.`importcount` AS `importcount`
FROM
  (
    (
      (
        (
          `killteam`.`Roster` `R`
          JOIN `killteam`.`User` `U` ON((`U`.`userid` = `R`.`userid`))
        )
        JOIN `killteam`.`Faction` `F` ON((`F`.`factionid` = `R`.`factionid`))
      )
      JOIN `killteam`.`Killteam` `K` ON(
        (
          (`K`.`factionid` = `R`.`factionid`)
          AND (`K`.`killteamid` = `R`.`killteamid`)
        )
      )
    )
    LEFT JOIN (
      SELECT
        `killteam`.`RosterOperative`.`userid` AS `userid`,
        `killteam`.`RosterOperative`.`rosterid` AS `rosterid`,
        `killteam`.`Operative`.`opname` AS `optype`,
        count(0) AS `opcount`,
        min(`killteam`.`RosterOperative`.`seq`) AS `firstseq`
      FROM
        (
          `killteam`.`RosterOperative`
          JOIN `killteam`.`Operative` ON(
            (
              (
                `killteam`.`Operative`.`factionid` = `killteam`.`RosterOperative`.`factionid`
              )
              AND (
                `killteam`.`Operative`.`killteamid` = `killteam`.`RosterOperative`.`killteamid`
              )
              AND (
                `killteam`.`Operative`.`fireteamid` = `killteam`.`RosterOperative`.`fireteamid`
              )
              AND (
                `killteam`.`Operative`.`opid` = `killteam`.`RosterOperative`.`opid`
              )
            )
          )
        )
      GROUP BY
        `killteam`.`RosterOperative`.`userid`,
        `killteam`.`RosterOperative`.`rosterid`,
        `killteam`.`Operative`.`opname`
    ) `RO` ON(
      (
        (`RO`.`userid` = `R`.`userid`)
        AND (`R`.`rosterid` = `RO`.`rosterid`)
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
  `R`.`TP`,
  `R`.`CP`,
  `R`.`VP`,
  `R`.`RP`,
  `R`.`ployids`,
  `R`.`tacopids`,
  `R`.`spotlight`,
  `F`.`factionname`,
  `K`.`killteamname`,
  `K`.`description`