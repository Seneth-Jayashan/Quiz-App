import React from 'react'

import Dashboard from '../pages/host/Dashboard';
import Account from '../pages/host/Account';
import Questions from '../pages/host/Questions';
import Result from '../pages/host/Result';
import Results from '../pages/host/Results';
import Sessions from '../pages/host/Sessions';
import { Route, Routes } from 'react-router-dom';

export default function userDashboard() {
  return (
    <div>
        <Routes>
            <Route path='/' element={<Dashboard/>}/>
            <Route path='/account' element={<Account/>}/>
            <Route path='/questions' element={<Questions/>}/>
            <Route path='/result' element={<Result/>}/>
            <Route path='/results' element={<Results/>}/>
            <Route path='/sessions' element={<Sessions/>}/>
        </Routes>
      
    </div>
  )
}
