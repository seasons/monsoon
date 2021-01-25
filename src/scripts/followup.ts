import "module-alias/register"

import sgMail from "@sendgrid/mail"

import { SegmentService } from "../modules/Analytics/services/segment.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { ErrorService } from "../modules/Error/services/error.service"
import { ImageService } from "../modules/Image/services/image.service"
import { SMSService } from "../modules/SMS/services/sms.service"
import { TwilioService } from "../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../modules/user/services/admissions.service"
import { PaymentUtilsService } from "../modules/Utils/services/paymentUtils.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const image = new ImageService(ps)
  const error = new ErrorService()
  const email = new EmailService(
    ps,
    utilsService,
    new EmailUtilsService(ps, error, image)
  )
  const admissions = new AdmissionsService(ps, utilsService)
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService(ps, segment)
  const sms = new SMSService(
    ps,
    twilio,
    twilioUtils,
    paymentUtils,
    error,
    email
  )

  // const emails = [
  //   "me@alexisohanian.com",
  //   "g@gk3designs.com",
  //   "hello@mikearndt.net",
  //   "willie.morris@gmail.com",
  //   "bryan.rosenblatt@gmail.com",
  //   "graysonsmaistrla@gmail.com",
  //   "yhk1@me.com",
  //   "jcope2010@gmail.com",
  //   "joe@ml.to",
  //   "tgym.candycorn@gmail.com",
  //   "fitz@rallyrd.com",
  //   "sishirvarghese@gmail.com",
  //   "jordihays@gmail.com",
  //   "ddinch@gmail.com",
  //   "cmmontes2@gmail.com",
  //   "akayaian@gmail.com",
  //   "joel97montano@gmail.com",
  //   "colin.dismuke@gmail.com",
  //   "me@andymccune.com",
  //   "reganbozman@gmail.com",
  //   "vivekxk@gmail.con",
  //   "jheuer@gmail.com",
  //   "ichabon@me.com",
  //   "kcole16@gmail.com",
  //   "drakerehfeld@gmail.com",
  //   "johnagate@gmail.com",
  //   "hello@thomaslikins.com",
  //   "richardkerby@gmail.com",
  //   "contact@bobbymckenna.us",
  //   "mpcaulfield92@gmail.com",
  //   "achal@achal.me",
  //   "j.yan93@gmail.com",
  //   "dgreenstein1111@gmail.com",
  //   "julian.fetterman@gmail.com",
  //   "scottaharris615@gmail.com",
  //   "Luke.belliveau@gmail.com",
  //   "phillip.nevins@gmail.com",
  //   "ssilver123@gmail.com",
  //   "mattpetermann@me.com",
  //   "brockmiller@gmail.com",
  //   "gabe.vacaliuc@gmail.com",
  //   "jonlikesjello@gmail.com",
  //   "adam.daroff@gmail.com",
  //   "cgccoyne@gmail.com",
  //   "me@clintecker.com",
  //   "jared.newman@yale.edu",
  //   "holtfrerich1997@gmail.com",
  //   "michaelmiraflor@gmail.com",
  //   "rygushue+1@gmail.com",
  //   "thomas@prysm.xyz",
  //   "teganmierle@gmail.com",
  //   "davalg@gmail.com",
  //   "r.andy.pahwa@gmail.com",
  //   "advaith.doosa@sjsu.edu",
  //   "ryan_ascencio@yahoo.com",
  //   "s.zaben86@gmail.com",
  //   "HEpstein10@gmail.com",
  //   "traviswarrenhiggins@gmail.com",
  //   "jacobmlazarus@gmail.com",
  //   "adamg2421@gmail.com",
  //   "colinhutt10@gmail.com",
  //   "jakecass.n@gmail.com",
  //   "divadofficial@gmail.com",
  //   "vibhork@gmail.com",
  //   "g@bobbyg.me",
  //   "michael@island.com",
  //   "ari.friedland@gmail.com",
  //   "bereaomalley@gmail.com",
  //   "humphreysu604@gmail.com",
  //   "aaron.brzowski@gmail.com",
  //   "adam.enbar@gmail.com",
  //   "zackskelly@gmail.com",
  //   "colinpin@gmail.com",
  //   "nik@sharmamedia.com",
  //   "sammusvee@gmail.com",
  //   "tomkit@gmail.com",
  //   "troubleinparadise@gmail.com",
  //   "matthew.j.dailey@gmail.com",
  //   "williej926@gmail.com",
  //   "gentianedwards@gmail.com",
  //   "ascrookes@gmail.com",
  //   "chengdavid923@gmail.com",
  //   "simyanliang@gmail.com",
  //   "carter@goop.com",
  //   "tsmeeton@gmail.com",
  //   "klinno727@gmail.com",
  //   "timothyhobrien@gmail.com",
  //   "thephucpham@icloud.com",
  //   "mrdanberry@gmail.com",
  //   "peter.dodd@warnerbros.com",
  //   "elliott@joinswitch.com",
  //   "RandSpence@gmail.com",
  //   "vincent.munoz@outlook.com",
  //   "stephenkyriacou@gmail.com",
  //   "j.benjamin.r@gmail.com",
  //   "hello@bartonsmith.me",
  //   "samhart812@gmail.com",
  //   "kit.halvorsen@gmail.com",
  //   "joogstarz@gmail.com",
  //   "hiramv@gmail.com",
  //   "dan@tryadhawk.com",
  //   "jordanvillay@gmail.com",
  //   "jordan.cjack@gmail.com",
  //   "a.angel.martinez@gmail.com",
  //   "hitylercampbell@gmail.com",
  //   "twflahertyiv@gmail.com",
  //   "nic.wilkins6@gmail.com",
  //   "max.chiswick@gmail.com",
  //   "kmrachid11@gmail.com",
  //   "shipman.andrew@gmail.com",
  //   "jason4859@gmail.com",
  //   "markjohnson303@gmail.com",
  //   "hmkrtchian@gmail.com",
  //   "nsameer90@gmail.com",
  //   "averystanford2016@gmail.com",
  //   "apqalves@gmail.com",
  //   "ihansen686@gmail.com",
  //   "boazgoldwater@gmail.com",
  //   "markdewittdaniel@gmail.com",
  //   "kaleelmunroe09@gmail.com",
  //   "amingates@gmail.com",
  //   "smalave17@gmail.com",
  //   "meaghan.gibbons09@gmail.com",
  //   "seasonsnyc@jh.to",
  //   "niko.ralf@gmail.com",
  //   "kosta@fossil.com",
  //   "benjaminwjang@gmail.com",
  //   "square_sd@hotmail.com",
  //   "Jared.Kahan@gmail.com",
  //   "karan705@hotmail.com",
  //   "bowyer.chris@gmail.com",
  //   "brian.wirtz@gmail.com",
  //   "hopkins.patrickj@gmail.com",
  //   "andrew@getpoint.io",
  //   "bryanhpchiang@gmail.com",
  //   "stefanmakes@gmail.com",
  //   "dennis@dennisbrackeen.com",
  //   "straussg@gmail.com",
  //   "nmiller214@gmail.com",
  //   "singh.kul@gmail.com",
  //   "raymondxma@gmail.com",
  //   "chh.holloway@gmail.com",
  //   "felipemnyc@gmail.com",
  //   "gca5an@virginia.edu",
  //   "natebosshard@gmail.com",
  //   "marcfelixcote@gmail.com",
  //   "and.diggle@gmail.com",
  //   "jkramer059@gmail.com",
  //   "andrew@outintech.com",
  //   "rjunior1029@gmail.com",
  //   "plawson31@hotmail.com",
  //   "jack@sound-ventures.com",
  //   "mh8202@gmail.com",
  //   "jmetcalf27@gmail.com",
  //   "emj72395@gmail.com",
  //   "gerardo.bandera@yahoo.com",
  //   "Rashaneharvey18@gmail.com",
  //   "adam.olas03@icloud.com",
  //   "yusimon23@gmail.com",
  //   "anthonyhendley176@gmail.com",
  //   "jacksblanks@gmail.com",
  //   "gcj2101@gmail.com",
  //   "brendan.ledesma@gmail.com",
  //   "head.jackson@icloud.com",
  //   "sean@everettadvisors.com",
  //   "jvf005@gmail.com",
  //   "jaa2994@gmail.com",
  //   "joeperez2k@yahoo.com",
  //   "urban.trend.maker@gmail.com",
  //   "winston.ford@gmail.com",
  //   "erickicherer@gmail.com",
  //   "stuartgoldfarb@mac.com",
  //   "srahman920@gmail.com",
  //   "eceretthackett@saschools.org",
  //   "a.sturgis2000@gmail.com",
  //   "Kalvinpage10@gmail.com",
  //   "braun.peter.r@gmail.com",
  //   "jred.weiss@gmail.com",
  //   "yun.aeri@gmail.com",
  //   "psjung2@illinois.edu",
  //   "worldsbestmike@yahoo.com",
  //   "mitchellhammer95@gmail.com",
  //   "r.andy.pahwa+3@gmail.com",
  //   "kellybenjaminwrites@gmail.com",
  //   "allforvali@gmail.com",
  //   "williamwalker2690@gmail.com",
  //   "macklaus15@gmail.com",
  //   "Nathangireland@gmail.com",
  //   "jeffrey.frye@gmail.com",
  //   "backstrombracey@gmail.com",
  //   "chrispennix@icloud.com",
  //   "npeoples4210@gmail.com",
  //   "kseewnanan@yahoo.com",
  //   "alec.dathaniel@gmail.com",
  //   "ztadile@yahoo.com",
  //   "michaelwalek@gmail.com",
  //   "reffef@gmail.com",
  //   "devine.bellamy@gmail.com",
  //   "crsanchezw@gmail.com",
  //   "reggiesingletary1093@gmail.com",
  //   "Smithjordan433@yahoo.com",
  //   "kelist9@gmail.com",
  //   "zach.ullman@leadedgecapital.com",
  //   "clark.nick64@yahoo.com",
  //   "giovannynescobar@outlook.com",
  //   "medanlee@gmail.com",
  //   "branferrell@gmail.com",
  //   "jones.joseph18@icloud.com",
  //   "austinclark1394@gmail.com",
  //   "j.a.morales@live.com",
  //   "merla.jonathan@gmail.com",
  //   "davidanthonyhanson@gmail.com",
  //   "nick.kottwitz@gmail.com",
  //   "farmingtonfalcon2010@gmail.com",
  //   "aren.marcoosi@gmail.com",
  //   "ryandbaird@gmail.com",
  //   "saloscar.93@gmail.com",
  //   "coney10@gmail.com",
  //   "enzonmoore04@gmail.com",
  //   "romanbarnette1@gmail.com",
  //   "connorg612@gmail.com",
  //   "danielsalahuddin@yahoo.com",
  //   "cjmarti2005@gmail.com",
  //   "samirreddy23@gmail.com",
  //   "tromero123@hotmail.com",
  //   "phortez@gmail.com",
  //   "klouie93@msn.com",
  //   "gabrieleiger@gmail.com",
  //   "fspitzer32@gmail.com",
  //   "bruno.rozzi@gmail.com",
  //   "ichho@uwaterloo.ca",
  //   "frakjrich23@gmail.com",
  //   "justinpshea@gmail.com",
  //   "andrewbfeigenbaum@gmail.com",
  //   "jacobchorches@gmail.com",
  //   "qwertyasdwek@live.com",
  //   "cferunden@yahoo.com",
  //   "sameertmg@gmail.com",
  //   "derakim@gmail.com",
  //   "germanmontiel89@icloud.com",
  //   "tonyg0118@icloud.com",
  //   "chris@stayhipp.com",
  //   "ethantolentino30@gmail.com",
  //   "svntos@protonmail.com",
  //   "dzmartinez14@gmail.com",
  //   "jason@unender.com",
  //   "andrewferdon@gmail.com",
  //   "keepesaaron@gmail.com",
  //   "kaanmce@gmail.com",
  //   "joshafowler@gmail.com",
  //   "mannyirockwell@yahoo.com",
  //   "thomas.myring@icloud.com",
  //   "saidjei12@gmail.com",
  //   "fengyuhang050798@gmail.com",
  //   "tholokai@gmail.com",
  //   "dannycharney@gmail.com",
  //   "devinross@me.com",
  //   "dean.garcia194@gmail.com",
  //   "cadegoodwin@icloud.com",
  //   "cdja101@gmail.com",
  //   "benmurray4@gmail.com",
  //   "nh1080@nyu.edu",
  //   "garciaj10@gmail.com",
  //   "shawnuberoi@gmail.com",
  //   "mattschmertz@gmail.com",
  //   "13duncanwilliams@gmail.com",
  //   "dahuggar@gmail.com",
  //   "spencer.n.jackson@colorado.edu",
  //   "forty.twenty@gmail.com",
  //   "rsgill26@gmail.com",
  //   "justinssexton@gmail.com",
  //   "shapiro.murphy@gmail.com",
  //   "claire.illmer@gmail.com",
  //   "femisopeze@mailinator.com",
  //   "jbardos24@gmail.com",
  //   "peyton.lennard300@gmail.com",
  //   "harshdeshmukh508@gmail.com",
  //   "jwilkins81895@gmail.com",
  //   "craig.courtney.cope@gmail.com",
  //   "ruiz.stephen.m@gmail.com",
  //   "riley.paro@gmail.com",
  //   "randy@workingtitlewip.com",
  //   "robert.strojan@gmail.com",
  //   "brand0923@gmail.com",
  //   "wrodriguez416@gmail.com",
  //   "faiyam+avatax@seasons.nyc",
  //   "david.j.shulman@gmail.com",
  //   "sterlingsberg@icloud.com",
  //   "photosbythomas3@gmail.com",
  //   "p3dolezal@gmail.com",
  //   "desmondphughes@gmail.com",
  //   "koreydonte@gmail.com",
  //   "bwilly@gmail.com",
  //   "14jordanoc@gmail.com",
  //   "aharmon2334@gmail.com",
  //   "evancraigsmith@gmail.com",
  //   "justin.dreyfuss@gmail.com",
  //   "mozhgan.shariat@gmail.com",
  //   "cantuivan@outlook.com",
  //   "quincywatson@ymail.com",
  //   "carter.crayne@hotmail.com",
  //   "lemueltweh@gmail.com",
  //   "godqorwh@naver.com",
  //   "briandfreel@gmail.com",
  //   "bourb561@gmail.com",
  //   "wellsdj97@gmail.com",
  //   "nicholas.tachibana@gmail.com",
  //   "ahmad.zubair16@gmail.com",
  //   "lnm@graphianyc.com",
  //   "mcmillendaniel@gmail.com",
  //   "phil.healy.toon@gmail.com",
  //   "sakekumo@gmail.com",
  //   "mlc1195@me.com",
  //   "ed.pearce12@gmail.com",
  //   "scott.clen@gmail.com",
  //   "mrcameronaguiar@gmail.com",
  //   "oliviat1212@gmail.com",
  //   "nickbigenho7@gmail.com",
  //   "diegoassandri@hotmail.com",
  //   "w@mnr.me",
  //   "joselunahrdz@gmail.com",
  //   "bruceofsc@gmail.com",
  //   "camgibbar@gmail.com",
  //   "tenishaclarke@icloud.com",
  //   "jcdlexis@gmail.com",
  //   "barreto-andres@hotmail.com",
  //   "supernayan@gmail.com",
  //   "osc.nav14@gmail.com",
  //   "daniel.hadi24@gmail.com",
  //   "rickynphung@gmail.com",
  //   "ericsparrow42@gmail.com",
  //   "andres.barreto.franco@gmail.com",
  //   "madhav516@gmail.com",
  //   "calen.ipalook@gmail.com",
  //   "sha9493@mac.com",
  //   "j.christopher.villar@gmail.com",
  //   "rach.lisner@gmail.com",
  //   "david.w.mcnamee@gmail.com",
  //   "jasonhino@gmail.com",
  //   "asang4422@gmail.com",
  //   "mahumshabir@gmail.com",
  //   "jmmmbreen@gmail.com",
  //   "jeff@monarchartists.com",
  //   "cunninghamnick7@gmail.com",
  //   "samtaliancich@outlook.com",
  //   "adrian.michael.williams@gmail.com",
  //   "braunsy86@yahoo.com",
  //   "jordankwilson@icloud.com",
  //   "joshtyreemyers@gmail.com",
  //   "davidjgreene@yahoo.com",
  //   "ll.create.ll@gmail.com",
  //   "joelac@gmail.com",
  //   "ilovesecondhandsmoke@gmail.com",
  //   "antwoinedjohnson@gmail.com",
  // ]
  const emailsTwo = [
    "me@alexisohanian.com",
    "david.j.shulman@gmail.com",
    "sterlingsberg@icloud.com",
    "photosbythomas3@gmail.com",
    "p3dolezal@gmail.com",
    "desmondphughes@gmail.com",
    "koreydonte@gmail.com",
    "bwilly@gmail.com",
    "14jordanoc@gmail.com",
    "aharmon2334@gmail.com",
    "evancraigsmith@gmail.com",
    "justin.dreyfuss@gmail.com",
    "mozhgan.shariat@gmail.com",
    "cantuivan@outlook.com",
    "quincywatson@ymail.com",
    "carter.crayne@hotmail.com",
    "lemueltweh@gmail.com",
    "godqorwh@naver.com",
    "briandfreel@gmail.com",
    "bourb561@gmail.com",
    "wellsdj97@gmail.com",
    "nicholas.tachibana@gmail.com",
    "ahmad.zubair16@gmail.com",
    "lnm@graphianyc.com",
    "mcmillendaniel@gmail.com",
    "phil.healy.toon@gmail.com",
    "sakekumo@gmail.com",
    "mlc1195@me.com",
    "ed.pearce12@gmail.com",
    "scott.clen@gmail.com",
    "mrcameronaguiar@gmail.com",
    "oliviat1212@gmail.com",
    "nickbigenho7@gmail.com",
    "diegoassandri@hotmail.com",
    "w@mnr.me",
    "joselunahrdz@gmail.com",
    "bruceofsc@gmail.com",
    "camgibbar@gmail.com",
    "tenishaclarke@icloud.com",
    "jcdlexis@gmail.com",
    "barreto-andres@hotmail.com",
    "supernayan@gmail.com",
    "osc.nav14@gmail.com",
    "daniel.hadi24@gmail.com",
    "rickynphung@gmail.com",
    "ericsparrow42@gmail.com",
    "andres.barreto.franco@gmail.com",
    "madhav516@gmail.com",
    "calen.ipalook@gmail.com",
    "sha9493@mac.com",
    "j.christopher.villar@gmail.com",
    "rach.lisner@gmail.com",
    "david.w.mcnamee@gmail.com",
    "jasonhino@gmail.com",
    "asang4422@gmail.com",
    "mahumshabir@gmail.com",
    "jmmmbreen@gmail.com",
    "jeff@monarchartists.com",
    "cunninghamnick7@gmail.com",
    "samtaliancich@outlook.com",
    "adrian.michael.williams@gmail.com",
    "braunsy86@yahoo.com",
    "jordankwilson@icloud.com",
    "joshtyreemyers@gmail.com",
    "davidjgreene@yahoo.com",
    "ll.create.ll@gmail.com",
    "joelac@gmail.com",
    "ilovesecondhandsmoke@gmail.com",
    "antwoinedjohnson@gmail.com",
  ]
  const customersToFollowupWith = await ps.binding.query.customers(
    {
      // where: {
      //   AND: [
      //     { user: { email_in: emailsTwo } },
      //     { status: "Authorized" },
      //     { user: { email_not_contains: "seasons.nyc" } },
      //     { user: { email_not_contains: "faiyamrahman.com" } },
      //     { user: { email_not_contains: "alexisohanian.com" } },
      //     { user: { email_not_contains: "mylesthompsoncreative@gmail.com" } },
      //   ],
      // },
      where: {
        AND: [{ status: "Waitlisted" }, { admissions: { admissable: true } }],
      },
      // where: {
      //   user: { email_contains: "faiyam" },
      // },
    },
    `{
      id
      status
      authorizedAt
      admissions {
        authorizationWindowClosesAt
      }
      user {
        id
        email
        firstName
        emails {
          emailId
        }
      }
    }`
  )
  const unsubscribes = ["mattpetermann@me.com", "ari.friedland@gmail.com"]
  for (const cust of customersToFollowupWith) {
    if (unsubscribes.includes(cust.user.email)) {
      continue
    }
    const receivedEmails = cust.user.emails.map(a => a.emailId)
    const dayTwoFollowupSent = receivedEmails.includes(
      "DayTwoAuthorizationFollowup"
    )
    const dayThreeFollowupSent = receivedEmails.includes(
      "DayThreeAuthorizationFollowup"
    )
    const daySixFollowupSent =
      receivedEmails.includes("DaySixAuthorizationFollowup") ||
      receivedEmails.includes("TwentyFourHourAuthorizationFollowup") // previous, deprecated email id. Maintain for backwards compatibility.

    const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")

    // Day 2 Followup
    // if (!dayTwoFollowupSent) {
    //   await email.sendAuthorizedDayTwoFollowup(cust.user, cust.status)
    //   console.log(`sent ${cust.user.email} day 2 followup`)
    //   continue
    // }

    // // Day 3 Followup
    if (!dayThreeFollowupSent) {
      const availableStyles = await admissions.getAvailableStyles({
        id: cust.id,
      })
      await email.sendAuthorizedDayThreeFollowup(
        cust.user,
        availableStyles,
        cust.status
      )
      console.log(`sent ${cust.user.email} day 3 followup`)
      continue
    }

    // Day 6 Followup
    // if (!daySixFollowupSent) {
    //   const availableStyles = await admissions.getAvailableStyles({
    //     id: cust.id,
    //   })
    //   await email.sendAuthorizedDaySixFollowup(cust.user, availableStyles)
    //   await sms.sendSMSById({
    //     to: { id: cust.user.id },
    //     renderData: { name: cust.user.firstName },
    //     smsId: "TwentyFourHourLeftAuthorizationFollowup",
    //   })
    //   console.log(`sent ${cust.user.email} day 6 followup`)
    //   continue
    // }

    // Rewaitlisted
    // if (!rewaitlistEmailSent) {
    //   const availableStyles = await admissions.getAvailableStyles({
    //     id: cust.id,
    //   })
    //   await email.sendRewaitlistedEmail(cust.user, availableStyles)
    //   await sms.sendSMSById({
    //     to: { id: cust.user.id },
    //     renderData: { name: cust.user.firstName },
    //     smsId: "Rewaitlisted",
    //   })
    //   await ps.client.updateCustomer({
    //     where: { id: cust.id },
    //     data: { status: "Waitlisted" },
    //   })
    //   console.log(`rewaitlisted ${cust.user.email}`)
    // }
  }
}
run()
