import React, {
  useState,
  useEffect
} from 'react';

import {BrowserRouter as Router, Route, Redirect, useHistory} from 'react-router-dom';

import {logInUser, registerCredential} from './util';
import './App.css';

function App() {
  const [fields, setState] = useState({
    username: '',
    password: '',
    user: null
  });
  const history = useHistory();
  useEffect(() => {
    const {username, password} = fields.user || {};
    console.log('useEffect', fields.user);
    if (username && password) {
      history.push('/home');
    } else if (username) {
      history.push('/password');
    }
  }, [fields.user, history]);
  const onInputChange = ({target}) => {
    setState({
      ...fields,
      [target.name]: target.value
    });
  };
  const onBtnClick = (data, path) => () => {
    logInUser(path, data, setState, fields);
  };
  const onRegisterCredential = () => {
    registerCredential({
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false
      }
    })
      .then(() => {
        console.log('registered')
      })
  }
  return (
    <div className="App">
      <main className="App-container">
        <form onSubmit={e => e.preventDefault()}>
          <Route path='/'>
            <Redirect to='/username'/>
          </Route>
          <Route path='/username'>
            <input type="text" name='username' placeholder='username' onChange={onInputChange} value={fields.username} />
            <button type="submit" className='btn-primary' onClick={onBtnClick(fields, 'username')}>
              Click
            </button>
          </Route>
          <Route path='/password'>
            {fields.user ?
              <input type="text" name='password' placeholder='password' onChange={onInputChange} value={fields.password} /> :
              <Redirect to='/username' />
            }
            <button type="submit" className='btn-primary' onClick={onBtnClick(fields, 'password')}>
              Click
            </button>
          </Route>
          <Route path='/home'>
            {
              fields.user && fields.user.password ? (
                <div>
                  <h1>Welcome</h1>
                  <button onClick={onRegisterCredential}>
                    Register Request
                  </button>
                </div>
              ) : <Redirect to='/password'/>
            }
          </Route>
        </form>
      </main>
    </div>
  );
}
const Root = () => {
  return (
    <Router>
      <App />
    </Router>
  )
}
export default Root;
