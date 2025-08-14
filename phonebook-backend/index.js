const express = require("express");
const app = express();

let notes = [
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
	res.send(`<p>Phonebook has info for ${notes.length} people</p>
        <p>${new Date()}</p>`);
});

app.get("/api/persons", (req, res) => {
	res.json(notes);
});

app.get("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    const note = notes.find((n) => n.id === id);
    
    if (note) {
        return res.json(note);
    } else {
        return res.status(400).json({ error: "content missing" });
    }
})

app.delete("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    notes = notes.filter(n => n.id !== id);
    return res.status(204);
})

const PORT = 3001;

app.listen(PORT, () => {
	console.log("Server running on port:", PORT);
});
