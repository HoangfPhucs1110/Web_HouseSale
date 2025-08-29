import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import UpdateListing from './pages/UpdateListing';
import Search from './pages/Search';
import PricePredictor from './pages/predict';
import Footer from './components/Footer';
import Guide from './pages/Guide';
import Faq from './pages/Faq';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import GlobalChat from './components/GlobalChat';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/search' element={<Search />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route path='/update-listing/:listingId' element={<UpdateListing />} />
        </Route>

        <Route path='/listing/:listingId' element={<Listing />} />
        <Route path='/dudoan' element={<PricePredictor />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/guide' element={<Guide />} />
        <Route path='/faq' element={<Faq />} />

        {/* --- Admin --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminUsers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
          </Route>
        </Route> {/* ✅ thẻ đóng còn thiếu */}
      </Routes>

      <GlobalChat />
      <Footer />
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </BrowserRouter>
  );
}
