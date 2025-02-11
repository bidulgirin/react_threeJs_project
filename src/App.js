import React, { useEffect, useRef, useState } from "react";
import BumpleFishContainer from "../src/components/Bumplefish";
import "./style/common.css";

function App() {
    return (
        <>
            <main>
                <div className="gf_background">
                    <BumpleFishContainer />
                </div>
                <div className="gf_container">
                    <section className="gf_section gf_flex c_c">
                        <div className="title">정말 멋진 물고기!</div>
                    </section>
                    <section className="gf_section">
                        <div className="title">title</div>
                        <div className="desc">
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                        </div>
                    </section>
                    <section className="gf_section">
                        <div className="title">title</div>
                        <div className="desc">
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명설명
                            설명설명설명설명설명설명설명설명설명설명
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

export default App;
