require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const Contact = require("./models/contact");

app.use(express.json());
app.use(
	morgan((tokens, req, res) =>
		[
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			req.method === "POST" ? JSON.stringify(req.body) : "",
		].join(" ")
	)
);
app.use(express.static("dist"));

/*
let persons = [
	{
		id: "1",
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: "2",
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: "3",
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: "4",
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];
*/

app.get("/info", async (req, res) => {
	try {
		console.log("Fetching information...");
		const count = await Contact.countDocuments({});
		res.send(`<p>Phonebook has info for ${count} people</p>
			<p>${new Date()}</p>`);
		console.log("Fetch successful");
	} catch (error) {
		console.log("Error getting the requested information:", error.message);
		res.status(500).send({ error: "something went wrong" });
	}
});

app.get("/api/persons", async (req, res) => {
	try {
		console.log("Fetching information...");
		res.send(await Contact.find({}));
		console.log("Fetch successful");
	} catch (error) {
		console.log("Error getting contacts", error.message);
		res.status(500).send({ error: "something went wrong" });
	}
});

app.get("/api/persons/:id", async (req, res) => {
	try {
		console.log("Fetching information by ID...");
		const contact = await Contact.findById(req.params.id);
		if (contact) {
			console.log("Fetch successful");
			res.json(contact);
		} else {
			console.log("No contact with that ID exists");
			res.status(404).json({ error: "Contact not found" });
		}
	} catch (error) {
		console.log("Error getting contact information:", error.message);
		res.status(500).send({ error: "something went wrong" });
	}
});

app.post("/api/persons", async (req, res) => {
	const person = req.body;

	if (!person.name) {
		console.log("POST request rejected: no name was submitted");
		return res.status(422).json({ error: "missing required property: name" });
	}

	if (!person.number) {
		console.log("POST request rejected: no name was submitted");
		return res.status(422).json({ error: "missing required property: number" });
	}

	try {
		if (await Contact.exists({ name: person.name })) {
			console.log(
				"POST request rejected: a contact with that name already exists"
			);
			return res
				.status(409)
				.json({ error: `${person.name} already exists in the phonebook` });
		}
		const contact = new Contact({
			name: person.name,
			number: person.number,
		});
		console.log("Saving contact to MongoDB...");
		const savedContact = await contact.save();
		console.log("Contact succesfully saved in MongoDB");
		return res.json(savedContact);
	} catch (error) {
		console.log("Error creating contact:", error.message);
		res.status(500).json({ error: "could not post to database" });
	}
});

app.delete("/api/persons/:id", async (req, res) => {
	try {
		if (!(await Contact.exists({ _id: req.params.id }))) {
			console.log("Contact does not exist on the phonebook");
			return res
				.status(404)
				.json({ error: "contact does not exist on the phonebook" });
		}
		await Contact.deleteOne({ _id: req.params.id });
		return res.status(204).end();
	} catch (error) {
		console.log("Error deleting the contact:", error.message);
		return res.status(500).end();
	}
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log("Server running on port:", PORT);
});
