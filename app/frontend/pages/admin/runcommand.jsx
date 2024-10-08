import React, { useCallback, useState } from 'react';

import ReactJson from 'react-json-view';
import axios from 'axios';

const RunCommand = () => {
  const [command, setCommand] = useState('');
  const [commandPayload, setCommandPayload] = useState('');
  const [response, setResponse] = useState({});

  const runCommand = useCallback(async () => {
    const { data } = await axios.get('/api/admin/runCommand', {
      params: {
        command,
        data: commandPayload,
      },
    });
    setResponse(data);
  }, [command, commandPayload]);

  return (
    <div>
      <div>
        <select value={command} onChange={(e) => setCommand(e.target.value)}>
          <option>Select Command</option>
          <option value="parseEmail">Parse Email</option>
          <option value="listGmailFilters">List Gmail Filters</option>
          <option value="addGmailFilter">Add Gmail Filter</option>
          <option value="populate">Populate</option>
          <option value="cloneNewsletterDigests">Clone Newsletters</option>
          <option value="extractCss">Extract Css</option>
        </select>
        <input
          type="text"
          value={commandPayload}
          onChange={(e) => setCommandPayload(e.target.value)}
          placeholder="data"
        />
        <input type="button" onClick={runCommand} value="Run Command" />
      </div>

      <ReactJson displayDataTypes={false} src={response} />
    </div>
  );
};

export default RunCommand;
