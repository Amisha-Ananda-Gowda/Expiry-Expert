// src/components/MyDatePicker.js
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Ensure this CSS file is created and includes your custom styles

const DatePicker = ({ selectedDate, onDateChange }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onDateChange}
      className="custom-datepicker"
    />
  );
};

export default DatePicker;
