import {useRef, useEffect, useState} from 'react';
import 'assets/css/author.scss'
const Author = () => {

    const authorRef = useRef(null);
    const [authorVisible, setAuthorVisible] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (authorRef.current && ! authorRef.current.contains(event.target)) {
                setAuthorVisible(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return() => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [authorRef]);

    const openAuthorDetails = () => {
        if (authorVisible) {
            return setAuthorVisible(false)
        }
        setAuthorVisible(true)
    }


    return (
        <>

            <div className={
                `abdullah-turkmen ${
                    authorVisible && 'open'
                }`
            }>
                <div className="avatar">
                    <div className="avatar-content">
                        <img src="https://abdullahturkmen.com/abdullah-turkmen-avatar.jpg" alt="Abdullah Turkmen"
                            onClick={
                                () => openAuthorDetails()
                            }
                            ref={authorRef}/>
                    </div>
                </div>
                <div className="contact linkedin">
                    <a target="_blank" rel="noreferrer" href="https://linkedin.com/in/abdullahturkmen">
                        <i className="fab fa-linkedin"></i>
                    </a>
                </div>
                <div className="contact github">
                    <a target="_blank" rel="noreferrer" href="https://github.com/abdullahturkmen">
                        <i className="fab fa-github"></i>
                    </a>
                </div>
                <div className="contact website">
                    <a target="_blank" rel="noreferrer" href="https://abdullahturkmen.com">
                        <i className="fa fa-globe"></i>
                    </a>
                </div>
            </div>

        </>
    )
}

export default Author