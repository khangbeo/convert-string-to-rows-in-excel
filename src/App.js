import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [formData, setFormData] = useState({
    inputString: '',
    fileName: '',
    header: '',
  });
  const [error, setError] = useState({});

  // Converts a string to an array buffer. This is necessary for the XLSX library to work.
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateInputs = () => {
    const errors = {};
    const { inputString, fileName, header } = formData;

    if (!inputString.trim()) errors.inputString = 'Please enter a string.';
    if (!fileName.trim()) errors.fileName = 'Please provide a file name.';
    if (!header.trim()) errors.header = 'Please provide a header name.';

    setError(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const convertStringToExcel = () => {
    if (!validateInputs()) return;

    const words = formData.inputString.split(/\s+/).flatMap((word) => {
      return /^\d{3}-\d{3}-\d{4}$/.test(word) ? [word] : word.split(' ');
    });

    const wb = XLSX.utils.book_new();
    const wsData = [[formData.header], ...words.map((word) => [word])];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${formData.fileName}.xlsx`;
    link.click();

    setFormData({ inputString: '', fileName: '', header: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertStringToExcel();
  };

  return (
    <>
      <h1>Convert a sequence of numbers (or any words) to rows in Excel</h1>
      <p>
        <strong>Use Case:</strong> takes a string input that's separated by
        spaces and put them in a column in an Excel file.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div>
            <input
              type="text"
              name="fileName"
              value={formData.fileName}
              onChange={handleChange}
              placeholder="Enter file name"
            />
            <div className="error">{error.fileName}</div>
          </div>

          <div>
            <input
              type="text"
              name="header"
              value={formData.header}
              onChange={handleChange}
              placeholder="Enter your header here"
            />
            <div className="error">{error.header}</div>
          </div>
        </div>

        <div>
          <input
            type="text"
            name="inputString"
            value={formData.inputString}
            onChange={handleChange}
            placeholder="Enter your string here"
          />
          <div className="error">{error.inputString}</div>
        </div>

        <button type="submit">Convert</button>
      </form>

      <div>
        <h2>Example string:</h2>
        <p>123-456-789 098-0765-04321 fee-fi-fo-fum i-like-cheese</p>
        <h2>Result:</h2>
        <table>
          <thead>
            <tr>
              <th>header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>123-456-789</td>
            </tr>
            <tr>
              <td>098-0765-04321</td>
            </tr>
            <tr>
              <td>fee-fi-fo-fum</td>
            </tr>
            <tr>
              <td>i-like-cheese</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
