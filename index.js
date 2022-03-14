'use strict';

const {Component} = React;
const {render} = ReactDOM;
const e = React.createElement;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: '',
            search: {
                table: 'orders',
                data: {}
            },
            searchItems: [],
            userName: '',
            password: '',
            date: {from: 0, to: 0},
            fields: []

        };
    }

    async makeRequest(url, callback) {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.search)
        };

        if (this.state.token) {
            init.headers['Authorization'] = `Bearer ${this.state.token}`;
        }

        if (url === 'login' || url === 'register') {
            init['body'] = JSON.stringify({
                table: 'users',
                data: {
                    name: this.state.userName,
                    password: this.state.password
                }
            });
        } else if (url === 'insert') {
            let body = {
                table: 'merchandise',
                data: {}
            };
            const inputs = document.getElementById("insert").querySelectorAll('input');
            inputs.forEach((element) => {
                body.data[element.name] = element.value;
            })
            init['body'] = JSON.stringify(body);
        } else if (url === 'report') {
            const searchResult = document.getElementById("searchResult").outerHTML;
            init['body'] = JSON.stringify(searchResult);
        } else {
            //    created: {
            //        $gte: document.getElementById("DateFrom").valueAsNumber,
            //            $lt: document.getElementById("DateTo").valueAsNumber,
            //    },

            init['body'] = JSON.stringify(this.state.search);
        }

        const res = await fetch(`http://127.0.0.1:3000/${url}`, init).then(data => data.json());
        callback(res);
    }

    Login() {
        return (
            <div className="container">
                <label htmlFor="uname"><b>Username</b></label>
                <input type="text" onChange={e => this.setState({userName: e.target.value})}
                       placeholder="Enter Username" name="uname" required/>

                <label htmlFor="psw"><b>Password</b></label>
                <input type="password" onChange={e => this.setState({password: e.target.value})}
                       placeholder="Enter Password" name="psw" required/>

                <button onClick={() => this.makeRequest(
                    'login',
                    (res) => this.setState({token: res})
                )}>Login
                </button>
            </div>
        );
    }

    addFilterToSearch(key, value) {
        this.setState(prevState => ({
            search: {
                ...prevState.search,
                data: {
                    ...prevState.search.data,
                    [key]: value
                }
            }
        }))
    }

    field(item, index) {
        function myFunction() {
            document.getElementById(`myDropdown${index}`).classList.toggle("show");
        }

        function filterFunction() {
            let input, filter, ul, li, a, i;
            input = document.getElementById(`myInput${index}`);
            filter = input.value.toUpperCase();
            const div = document.getElementById(`myDropdown${index}`);
            a = div.getElementsByTagName("a");
            for (i = 0; i < a.length; i++) {
                const txtValue = a[i].textContent || a[i].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    a[i].style.display = "";
                } else {
                    a[i].style.display = "none";
                }
            }
        }

        return (
            <div key={index} className="dropdown">
                <button onClick={() => myFunction()} className="dropbtn">{item.field}</button>
                <div id={`myDropdown${index}`} className="dropdown-content">
                    <input type="text" placeholder={`Search ${item.field}..`} id={`myInput${index}`} onKeyUp={() =>
                        filterFunction()
                    }/>
                    {item.values.map((value, itemIndex) =>
                        <a key={itemIndex} onClick={() => this.addFilterToSearch(item.field, value)}>{value}</a>
                    )}
                </div>
            </div>
        )
    }

    searchResult() {
        return (
            <div id='searchResult'>
                <table>
                    <thead>
                    <tr>
                        {this.state.fields.map((item) => <th>{item.field}</th>)}
                    </tr>
                    </thead>
                    <tbody id="searchResultBody">
                    {this.state.searchItems.map((item, index) => this.searchResultItem(item, index))}
                    </tbody>
                </table>
            </div>
        );
    }

    searchResultItem(item, index) {
        const tbody = document.getElementById("searchResultBody");
        let tr1 = document.createElement("tr");
        let tr2 = document.createElement("tr");
        const br = document.createElement("br");
        tr1.id = `temp1${index}`;
        tr1.className = `searchResultBodyItemRow`;
        tr2.id = `temp2${index}`;
        tr2.className = `searchResultBodyItemRowMore`;

        tbody.appendChild(tr1);
        tbody.appendChild(br);
        tbody.appendChild(tr2);

        tr1 = document.getElementById(`temp1${index}`);
        tr2 = document.getElementById(`temp2${index}`);

        const keys = Object.keys(item);
        let defaultResult = [];
        let showMore = [];


        keys.map((key) => {
            if (Array.isArray(item[key])) {
                item[key].map((bbb) => {
                    Object.keys(bbb).map((ccc) => showMore.push(`${ccc}: ${bbb[ccc]}`));
                });
            } else {
                defaultResult.push(item[key]);
            }
        });

        defaultResult.map((ddd) => {
                const td = document.createElement("td");
                td.innerHTML = ddd;
                tr1.appendChild(td);
            }
        );

        showMore.map((ddd) => {
                const td = document.createElement("td");
                td.innerHTML = ddd;
                tr2.appendChild(td);
            }
        );

        function showMoreToggle() {
            document.getElementById(`temp2${index}`).classList.toggle("searchResultBodyItemRowLess");
        }

        const td = document.createElement("td");
        td.innerHTML = 'Show more';
        td.onclick = showMoreToggle;
        tr1.appendChild(td);
    }

    search() {
        function openForm(id) {
            document.getElementById(id).style.display = "block";
        }

        function closeForm(id) {
            document.getElementById(id).style.display = "none";
        }

        return (
            <div className="container">
                <div style={{display: 'flex'}}>
                    <h1 style={{width: '60%'}}>Have a search</h1>
                    <button style={{width: '10%'}} onClick={() => openForm('insert')}>Insert new product</button>
                    <button style={{width: '10%'}} onClick={() => openForm('newUser')}>Create new user</button>
                    <button style={{width: '10%'}} onClick={() => this.makeRequest(
                        'report',
                        (res) => alert(res)
                    )}>Create report</button>
                    <button style={{width: '10%'}} onClick={() => this.setState({token: ''})}>Logud</button>
                </div>

                <div className="form-popup" id="insert">
                    <h1>Insert new product</h1>

                    <label htmlFor="title"><b>title</b></label>
                    <input type="text" placeholder="Enter title" name="title" required/>
                    <br/>
                    <label htmlFor="description"><b>description</b></label>
                    <input type="text" placeholder="Enter description" name="description" required/>
                    <br/>
                    <label htmlFor="price"><b>price</b></label>
                    <input type="number" placeholder="Enter price" name="price" required/>
                    <br/>
                    <label htmlFor="supplier"><b>supplier</b></label>
                    <input type="text" placeholder="Enter supplier" name="supplier" required/>
                    <br/>
                    <label htmlFor="stock"><b>stock</b></label>
                    <input type="number" placeholder="Enter stock" name="stock" required/>


                    <button type="submit" onClick={() => this.makeRequest(
                        'insert',
                        (res) => alert(res)
                    )}>Insert new product</button>
                    <button type="button" onClick={() => closeForm('insert')}>Close</button>
                </div>

                <div className="form-popup" id="newUser">
                    <h1>Create new user</h1>

                    <label htmlFor="uname"><b>Username</b></label>
                    <input type="text" onChange={e => this.setState({userName: e.target.value})}
                           placeholder="Enter Username" name="uname" required/>

                    <label htmlFor="psw"><b>Password</b></label>
                    <input type="password" onChange={e => this.setState({password: e.target.value})}
                           placeholder="Enter Password" name="psw" required/>

                    <button type="submit" onClick={() => this.makeRequest(
                        'register',
                        (res) => alert(res)
                    )}>Create new user</button>
                    <button type="button" onClick={() => closeForm('newUser')}>Close</button>
                </div>

                <div>
                    <select
                        className="dropbtn"
                        onChange={e => this.setState({
                            search: {table: e.target.value, data: {}},
                            fields: [],
                            searchItems: []
                        })}
                        value={this.state.search.table}>
                        <option value="orders">Orders</option>
                        <option value="merchandise">Merchandise</option>
                    </select>

                    {this.state.fields.map((res, index) => this.field(res, index))}

                    <input type="datetime-local" id="DateFrom"/>
                    <input type="datetime-local" id="DateTo"/>

                    <button onClick={() => {
                        document.getElementById("searchResultBody").innerHTML = '';
                        this.makeRequest(
                            'search',
                            (res) => this.setState({searchItems: res})
                        );
                    }}>Apply
                    </button>

                    <button onClick={() => {
                        console.log('test', this.state.search);
                    }}>Apply2
                    </button>

                </div>

                {this.searchResult()}

            </div>
        );
    }

    render() {
        if (!this.state.token) {
            return (this.Login());
        }

        if (this.state.fields.length <= 0) {
            this.makeRequest(
                'fields',
                (res) => this.setState({fields: res})
            );
        }

        return (this.search());


        // return e(
        //     'button',
        //     {onClick: () => this.setState({token: true})},
        //     'Like'
        // );
    }
}

const domContainer = document.querySelector('#root');
render(e(App), domContainer);