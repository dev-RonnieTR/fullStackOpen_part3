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

app.get("/info", async (req, res, next) => {
	try {
		const count = await Contact.countDocuments({});
		res.send(`<p>Phonebook has info for ${count} people</p>
			<p>${new Date()}</p>`);
	} catch (error) {
		next(error);
	}
});

app.get("/api/persons", async (req, res, next) => {
	try {
		res.send(await Contact.find({}));
	} catch (error) {
		next(error);
	}
});

app.get("/api/persons/:id", async (req, res, next) => {
	try {
		const contact = await Contact.findById(req.params.id);
		if (contact) {
			res.json(contact);
		} else {
			console.log("No contact with that ID exists");
			res.status(404).json({ error: "Contact not found" });
		}
	} catch (error) {
		next(error);
	}
});

app.post("/api/persons", async (req, res, next) => {
	const person = req.body;

	if (!person.name) {
		console.log("POST request rejected: no name was submitted");
		return res.status(422).json({ error: "missing required property: name" });
	}

	if (!person.number) {
		console.log("POST request rejected: no number was submitted");
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
		const savedContact = await contact.save();
		console.log("Contact succesfully saved in MongoDB");
		return res.json(savedContact);
	} catch (error) {
		next(error);
	}
});

app.delete("/api/persons/:id", async (req, res, next) => {
	try {
		const deleted = await Contact.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res
				.status(404)
				.json({ error: "Contact does not exist on the phonebook" });
		}
		return res.status(204).end();
	} catch (error) {
		next(error);
	}
});

const errorHandler = (error, req, res, next) => {
	if (error.name === "CastError")
		return res.status(400).json({ error: error.message });
	if (error.name === "ValidationError")
		return res.status(400).json({ error: error.message });
	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log("Server running on port:", PORT);
});
