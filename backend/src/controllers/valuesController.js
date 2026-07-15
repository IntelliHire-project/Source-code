const valueModel = require("../models/valueModel");

const getAllValues = async (req, res, next) => {
  try {
    const values = await valueModel.getAllValues();
    // Sending values array back to the client
    res.send(values);
  } catch (error) {
    next(error);
  }
};

const addValue = async (req, res, next) => {
  try {
    const { value } = req.body;

    if (!value) {
      return res.send({ working: false });
    }

    await valueModel.insertValue(value);
    res.send({ working: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllValues,
  addValue,
};

