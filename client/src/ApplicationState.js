import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const ApplicationState = ({ children }) => {
    const [userId, setUserId] = useState(() => sessionStorage.getItem('userId'));

    useEffect(() => {
        if (userId) {
            sessionStorage.setItem('userId', userId);
            //sessionStorage.removeItem('userId');
        } else {
            sessionStorage.removeItem('userId');
        }
    }, [userId]);


    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    ); 
}