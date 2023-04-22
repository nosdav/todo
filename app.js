import { html, Component, render } from './js/spux.js';
import { getPath, getQueryStringValue, loadFile, saveFile } from './util.js';
import './js/dior.js'

export class App extends Component {
  constructor() {
    super();

    const serverUrl = getQueryStringValue('storage') || di.data.storage || 'https://nosdav.nostr.rocks'
    const mode = getQueryStringValue('mode') || di.data.m || 'm'
    const uri = getQueryStringValue('uri') || di.data.uri || 'tasks.json'

    this.state = {
      userPublicKey: null,
      filename: uri,
      fileContent: '[]',
      tasks: [],
      taskInput: '',
      serverUrl: serverUrl,
      mode: mode,
    };
  }

  async componentDidMount() {
    // await this.userLogin();
  }

  handleInputChange = (event) => {
    this.setState({ taskInput: event.target.value });
  }

  userLogin = async () => {
    const userPublicKey = await window.nostr.getPublicKey();
    console.log(`Logged in with public key: ${userPublicKey}`);
    await this.setState({ userPublicKey: userPublicKey });
    this.loadTasks();
  }

  loadTasks = async () => {
    const { userPublicKey, serverUrl, mode, filename } = this.state;
    const fileContent = await loadFile(serverUrl, userPublicKey, filename, mode);

    if (fileContent) {
      this.setState({ fileContent: fileContent, tasks: JSON.parse(fileContent) });
    }
  };

  saveTasks = async () => {
    const { tasks, userPublicKey, serverUrl, mode, filename } = this.state;
    const fileContent = JSON.stringify(tasks);
    const success = await saveFile(serverUrl, userPublicKey, filename, mode, fileContent);

    if (!success) {
      alert('Error saving tasks');
    }
  };

  addTask = () => {
    const { taskInput, tasks } = this.state;
    if (taskInput) {
      const newTask = {
        '@id': Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        created_at: Math.floor(Date.now() / 1000),
        content: taskInput,
      };
      const updatedTasks = [...tasks, newTask];
      this.setState({ tasks: updatedTasks, taskInput: '' }, this.saveTasks);
    }
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return dateTimeFormat.format(date);
  };

  timeAgo(timestamp) {
    const now = new Date().getTime() / 1000;
    const secondsPast = Math.floor(now - timestamp);
    if (secondsPast < 60) {
      return `${secondsPast} seconds ago`;
    }
    const minutesPast = Math.floor(secondsPast / 60);
    if (minutesPast < 60) {
      return `${minutesPast} minutes ago`;
    }
    const hoursPast = Math.floor(minutesPast / 60);
    if (hoursPast < 24) {
      return `${hoursPast} hours ago`;
    }
    const daysPast = Math.floor(hoursPast / 24);
    if (daysPast < 30) {
      return `${daysPast} days ago`;
    }
    const monthsPast = Math.floor(daysPast / 30);
    if (monthsPast < 12) {
      return `${monthsPast} months ago`;
    }
    const yearsPast = Math.floor(monthsPast / 12);
    return `${yearsPast} years ago`;
  }



  deleteTask = (taskId) => {
    const updatedTasks = this.state.tasks.filter((task) => task['@id'] !== taskId);
    this.setState({ tasks: updatedTasks }, this.saveTasks);
  };

  handleKeyUp = (event) => {
    console.log(event.key)
    if (event.key === 'Enter') {
      console.log('enter pressed')
      this.addTask();
    }
  };
  render() {
    const { userPublicKey, taskInput, tasks } = this.state;

    return html`
      <div class="container">
        <h1>To-Do List</h1>
        <input
          type="text"
          id="taskInput"
          placeholder="Enter a new task"
          value=${taskInput}
          onChange=${this.handleInputChange}
          onKeyUp=${this.handleKeyUp}
        />
        <br/>
        <br/>
  
        ${userPublicKey
        ? html`
              <button onClick="${this.addTask}" type="button" style="background-color: #4CAF50; color: white; border: none; border-radius: 5px; padding: 5px 10px;">
                Add Task
              </button>
            `
        : html` <button style="background-color: #4CAF50; color: white; border: none; border-radius: 5px; padding: 5px 10px;" id="login" onClick="${this.userLogin}">
              Login
            </button>`}
  
        <ul id="taskList">
          ${tasks
        .slice(0)
        .reverse()
        .map(
          (task) => html`
                <li>
                  <div style="display: flex; align-items: center;">
                    ${task.content}
                  </div>
                  <span class="timestamp">
                  ${this.timeAgo(task.created_at)}
                </span>
                  <button class="delete-btn" onClick=${() => this.deleteTask(task['@id'])}>
                    🗑️
                  </button>
                </li>
              `
        )}
      </ul>
    </div>
    `;
  }

}

render(html` <${App} /> `, document.body)
