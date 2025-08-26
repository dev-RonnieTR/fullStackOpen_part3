const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());
app.use(morgan((tokens, req, res) => [
	tokens.method(req, res),
	tokens.url(req, res),
	tokens.status(req, res),
	tokens.res(req, res, "content-length"), "-",
	tokens["response-time"](req, res), "ms",
	req.method === "POST" ? JSON.stringify(req.body) : ""
].join(" ")))
app.use(express.static("dist"))

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

app.get("/info", (req, res) => {
	res.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`);
});

app.get("/api/persons", (req, res) => {
	res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	const note = persons.find((n) => n.id === id);

	if (note) {
		return res.json(note);
	} else {
		return res.status(400).json({ error: "missing required property: number" });
	}
});

app.delete("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	persons = persons.filter((n) => n.id !== id);
	return res.status(204);
});

app.post("/api/persons", (req, res) => {
	const person = req.body;

	if (!person.name) {
		return res.status(422).json({ error: "missing required property: name" });
	}
	if (!person.number) {
		return res.status(422).json({ error: "missing required property: number" });
	}

	if (
		persons.some(
			(p) => p.name.toLocaleLowerCase() === person.name.toLocaleLowerCase()
		)
	) {
		return res.status(409).json({ error: `${person.name} already exists` });
	}

	const id = Math.floor(Math.random() * 9000000000000000);
	person.id = id;

	persons = [...persons, person];
	res.json(person);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log("Server running on port:", PORT);
});
