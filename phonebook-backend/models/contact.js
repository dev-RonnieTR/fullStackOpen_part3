const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

(async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");
	} catch (error) {
		console.log("Error connecting to MongoDB:", error.message);
		process.exit(1);
	}
})();

const contactSchema = new mongoose.Schema({
	name: { type: String, required: [true, "Name is required"], minLength: [3, "Name must be at least 3 characters long"] },
	number: { type: String, required: [true, "Number is required"], minLength: [3, "Number must be at least 3 characters long"]},
});

contactSchema.set("toJSON", {
	transform: (document, returnedObj) => {
		returnedObj.id = returnedObj._id.toString();
		delete returnedObj._id;
		delete returnedObj.__v;
	},
});

module.exports = mongoose.model("Contact", contactSchema);
