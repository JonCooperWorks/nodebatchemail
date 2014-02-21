/*
 * Send scheduled emails using node-cron and nodemailer.
 */

var analyze = require('Sentimental').analyze,
	bl = require('bl'),
	CronJob = require("cron").CronJob,
	express = require("express"),
	http = require("http"),
	nodemailer = require("nodemailer");

// Mock student database
var users = [];
for (var i=0; i<10; i++) {
	users.push({
		username: "62000000" + i,
		email: "student" + i + "@uwimona.edu.jm"
	});
}

var app = express();

// Middleware
app.configure(function () {
	app.use(express.bodyParser());
});

app.get("/batchmail", function (request, response) {
	var transport = nodemailer.createTransport("SMTP", {
		service: "Gmail",
		auth: {
			user: "surveymailer450@gmail.com",
			pass: "password is awesome"
		}
	});

	users.map(function (user) {
		var options = {
			from: "surveymailer450@gmail.com",
			to: user.email,
			subject: "Hello, student",
			text: "Hello, student",
			html: "<b>Hello, student</b>"
		};

		transport.sendMail(options, function (err, response) {
			if(err) {
				console.error(err);
			} else {
				console.log("Message sent: " + response.message);
			}
		});
	});

	transport.close();

	response.send("Messages sent");
});

app.post("/sentimentanalysis", function (request, response) {
	response.send(analyze(request.body.text));
});

app.post("/configurecron", function (request, response) {
	var start = request.body,
	date = new Date(start.year, start.month, start.day);
	new CronJob(date, function () {
		http.get("/batchmail", function (resp) {
			resp.pipe(bl(function (err, data) {
				if (err) {
					response.send(500);
				}

				response.send(data.toString());
			}));
		});
	});;

	response.send({status: "success", date: date});
});

app.listen(3000);
console.log("Running app.");
