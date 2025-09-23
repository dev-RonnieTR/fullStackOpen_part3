const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log("Missing argument: enter password as third argument");
	process.exit(1);
}

const [password, name, number] = process.argv.slice(2);

const url = ``;

mongoose.set("strictQuery", false);


mongoose.connect(url);

const contactSchema = new mongoose.Schema({
	name: String,
	number: String,
});
const Contact = mongoose.model("Contact", contactSchema);

if (process.argv.length === 3) {
	const findContacts = async () => {
		const result = await Contact.find({});
		result.forEach((contact) => {
			console.log(contact);
		});
		mongoose.connection.close();
	};
	findContacts();
} else if (process.argv.length < 5) {
	console.log(
		"Missing argument: to add a contact, enter name and number as fourth and fifth arguments respectively"
	);
} else {
	const contact = new Contact({
		name,
		number,
	});
	const saveContact = async () => {
		const result = await contact.save();
		console.log(`Added ${name}'s number ${number} to phonebook`);
		mongoose.connection.close();
	};
	saveContact();
}
