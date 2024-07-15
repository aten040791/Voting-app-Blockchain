import React, { useEffect } from 'react'
import './App.css'
import {getContractInstance,getAccount} from './contractInstance'

//get user
function getUser() {
  const user = localStorage.getItem('user')
  const userObj = JSON.parse(user)
  if (user && userObj.username) {
    return userObj
  }
  return false
}

//switch network
async function switchChainToGanache() {
  //switch chain to ganache
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
        {
            chainId: '0x539', //1337
            chainName: 'Ganache',
            rpcUrls: ['http://127.0.0.1:7545'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
          },
          blockExplorerUrls: ['http://127.0.0.1:7545'], // Optional
        },
    ],
  });
}

// transform array to statistics number of vote
function transformArrayToAggregate(originalArray) {
  const voteCounts = originalArray.reduce((acc, { voteFor }) => {
    acc[voteFor] = (acc[voteFor] || 0) + 1;
    return acc;
  }, {});

  const resultArray = Object.entries(voteCounts).map(([voteFor, count]) => ({
      voteFor: Number(voteFor),
      count
  })).sort((a, b) => b.count - a.count); // Sort by count in descending order;

  return resultArray
}

function App() {

  const [candidates, setCandidates] = React.useState([])

  const [voteResult, setVoteResult] = React.useState([]) 

  const [credentials, setCredentials] = React.useState({
    loggedIn: false,
    form: {
      username: '',
      password: '',
    }
  })

  const [voteFor, setVoteFor] = React.useState({})


  //fetch list of people
  useEffect(() => {
    async function fetchPerson() {
      const res = await fetch('http://localhost:3000/candidates');
      const {data} = await res.json();
      setCandidates(data)
    }

    fetchPerson()
  }, [])

  //fetch voted list
  useEffect(() => {
    async function fetchVotedList() {
      const contractInstance = await getContractInstance()
      const rawVoteResults = await contractInstance.methods.getVotedCandidates().call()
      const voteResults = rawVoteResults.map(item => {
        return {
          voteBy: Number(item[0].toString()),
          voteFor: Number(item[1].toString())
        }
      })

      setVoteResult(voteResults)
    }

    fetchVotedList()
  }, [])


  // Voting
  const vote = async (e) => {
    e.preventDefault()
    if (voteFor.id != -1) {
      const contractInstance = await getContractInstance()
      if (contractInstance) {
        try {
          await switchChainToGanache()
          
          const account = await getAccount();
          //send transaction
          const sendObj = contractInstance.methods.vote(getUser().id, voteFor.id, voteFor.name).send({from: account[0]})
          sendObj.on('receipt', detail => {
            const {voterId, candidateId} = detail.events.votedEvent.returnValues
            setVoteResult([...voteResult, {voteBy: voterId, voteFor: candidateId}])
          })
          
        } catch (error) {
          console.log("hi", error)
          console.error('Error calling contract method', error);
        }
      }
    }
  }

  //login
  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify(credentials.form),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const {data} = await res.json()
    if (data) {
      localStorage.setItem('user', JSON.stringify(data))
      setCredentials({
        ...credentials,
        loggedIn:true
      })
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setCredentials({
      ...credentials,
      loggedIn: false
    })
  }

  return (
    <div className="container" style={{width: 500}}>

    {/* Login */}
      {!getUser() && !credentials.loggedIn &&
        <form onSubmit={(e) => login(e)}>
          <div className='form-group'>
              <input type="text" placeholder='Username' value={credentials.username} onChange={(e) => setCredentials({...credentials, form: {...credentials.form, username: e.target.value}})}/>
          </div>

          <div className='form-group'>
              <input type="text" placeholder='Password' value={credentials.password} onChange={(e) => setCredentials({...credentials, form: {...credentials.form, password: e.target.value}})}/>
          </div>
          <button type="submit">Login</button>
        </form>
      }
      
      {getUser() && <a href='#' onClick={logout}>Logout: {getUser().username}</a>}

      {getUser() &&
        <div className="row">
        <div className="col-lg-12">
          <h1 className="text-center">Election Results</h1>
          <hr/>
          <br/>
        
          <div id="content">
            {/* if not login, then hide table */}
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Votes</th>
                  </tr>
                </thead>
                <tbody id="candidatesResults">
                  {voteResult && voteResult.length == 0 && <tr><td colSpan={3}>No data</td></tr> }
                  
                  {voteResult && transformArrayToAggregate(voteResult).map((vote,index) => (
                    <tr key={vote.voteFor}>
                      <td>{index+1}</td>
                      <td>{candidates.find(item => item.id == vote.voteFor).name}</td>
                      <td>{vote.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>     
            
            <hr/>
              
                {voteResult.filter(item => item.voteBy == getUser().id).length == 0 &&
                  <form onSubmit={(e) => vote(e)}>
                    <div className="form-group">
                      <label htmlFor="candidatesSelect">Select Candidate</label>
                      <select className="form-control" id="candidatesSelect" onChange={(e) => {
                          const obj = JSON.parse(e.target.value)
                          return setVoteFor({
                            id: obj.id || -1,
                            name: obj.name || null
                          })
                      }}>
                        <option value="-1"> -- Please select --</option>
                        {candidates.map(candidate => (
                          <option value={JSON.stringify({id: candidate.id, name:candidate.name})} key={candidate.id} name={candidate.name}>{candidate.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={voteFor.id == -1}>Vote</button>
                    <hr />
                  </form>
                }
          </div>
        </div>
      </div>
      }
    </div>
  )
}

export default App
