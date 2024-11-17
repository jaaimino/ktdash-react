SELECT
  `RO`.`userid` AS `userid`,
  `RO`.`rosterid` AS `rosterid`,
  `RO`.`rosteropid` AS `rosteropid`,
  `RO`.`seq` AS `seq`,
  `RO`.`opname` AS `opname`,
  `RO`.`factionid` AS `factionid`,
  `RO`.`killteamid` AS `killteamid`,
  `RO`.`fireteamid` AS `fireteamid`,
  `RO`.`opid` AS `opid`,
  `RO`.`hascustomportrait` AS `hascustomportrait`,
  `RO`.`specialism` AS `specialism`,
  `RO`.`isinjured` AS `isinjured`,
  `RO`.`rested` AS `rested`,
  `O`.`M` AS `M`,
  `O`.`APL` AS `APL`,
  `O`.`GA` AS `GA`,
  `O`.`DF` AS `DF`,
  `O`.`SV` AS `SV`,
  `O`.`W` AS `W`,
(
    CASE
      WHEN (`R`.`keyword` <> '') THEN REPLACE(
        `O`.`keywords`,
        `K`.`customkeyword`,
        concat('<', `R`.`keyword`, '>')
      )
      ELSE `O`.`keywords`
    END
  ) AS `keywords`,
  `O`.`basesize` AS `basesize`,
  `O`.`specialisms` AS `specialisms`,
  `RO`.`curW` AS `curW`,
  `RO`.`activated` AS `activated`,
  `RO`.`oporder` AS `oporder`,
  `RO`.`hidden` AS `hidden`,
  `RO`.`wepids` AS `wepids`,
  `RO`.`eqids` AS `eqids`,
  `RO`.`notes` AS `notes`,
  `RO`.`xp` AS `xp`,
  `U`.`username` AS `username`,
  `R`.`rostername` AS `rostername`,
  `F`.`factionname` AS `factionname`,
  `K`.`killteamname` AS `killteamname`,
  `K`.`edition` AS `edition`,
  `FT`.`fireteamname` AS `fireteamname`,
  `FT`.`archetype` AS `archetype`,
  `O`.`opname` AS `optype`
FROM
  (
    (
      (
        (
          (
            (
              `killteam`.`RosterOperative` `RO`
              JOIN `killteam`.`User` `U` ON((`U`.`userid` = `RO`.`userid`))
            )
            JOIN `killteam`.`Roster` `R` ON(
              (
                (`R`.`userid` = `RO`.`userid`)
                AND (`R`.`rosterid` = `RO`.`rosterid`)
              )
            )
          )
          LEFT JOIN `killteam`.`Faction` `F` ON((`F`.`factionid` = `RO`.`factionid`))
        )
        LEFT JOIN `killteam`.`Killteam` `K` ON(
          (
            (`K`.`factionid` = `RO`.`factionid`)
            AND (`K`.`killteamid` = `RO`.`killteamid`)
          )
        )
      )
      LEFT JOIN `killteam`.`Fireteam` `FT` ON(
        (
          (`FT`.`factionid` = `RO`.`factionid`)
          AND (`FT`.`killteamid` = `RO`.`killteamid`)
          AND (`FT`.`fireteamid` = `RO`.`fireteamid`)
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