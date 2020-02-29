import React, {ReactNode, useState} from 'react';
import { Jumbotron, Button, Form, FormGroup, Label, Input, FormText, Table } from 'reactstrap';
import styled from 'styled-components';
import {analyzeText, Result} from "../backend";
import Tippy from '@tippy.js/react';

export function MainPage(){
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const[results, setResults] = useState<Result[]|null>(null);
  const [conceptIds, setConceptIds] = useState([]);
  const [idRef, setIdRef] = useState<string|null>(null);

  function handleUpload(e){
    let file: File = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdRef(reader.result as string);
    };
    reader.readAsText(new Blob([file]));
  }

  return(
      <Page>
        <Jumbotron style={{height: "100%"}}>
          <p>ボブは朝ご飯を早く食べた</p>
          <h2 className="display-4">Input text containing japanese here:</h2>
          <Form>
            <FormGroup>
              <TextArea type="textarea" name="text" id="exampleText" value={text} onChange={e => setText(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Id reference csv (optional): </Label>
              <Input type="file" onChange={(e) => console.log(e.target.files)}/>
            </FormGroup>
            <Button onClick={async () => {
              setLoading(true);
              const result = await analyzeText(text, idRef);
              setResults(result.sents);
              setConceptIds(result.concepts)
              setLoading(false);
            }}>Recognize concepts in text!</Button>
          </Form>
          {conceptIds && conceptIds.length > 0 && conceptIds.join(", ")}
          {results && <>
            {results.map(result => (
                <>

            <ResultDisplay {...result}/>

                </>
            ))}
              </>}
        </Jumbotron>
      </Page>
  )
}

function ResultDisplay(data: Result){
  console.log(data);
  const [activeIndex, setActiveIndex] = useState<number|null>(null);
  let displayData : {message: string, level: number, start: number, color: string, text: string, type: string, index?: number}[] = [];
  const words = data.verbose_found_words.map(([word, index, surface], mapIndex) => ({message:word, level: mapIndex, start: index[0], color: "red", text: surface}));
  // @ts-ignore
 let grammars = data.verbose_found_grammars.map(([gram, coords], mapIndex) => coords.filter(elem => elem.start != elem.end).map(({abs_pos}) => ({message:gram, level:abs_pos[0], start: abs_pos[0], color:"blue", text: data.sent.substring(abs_pos[0], abs_pos[1])})));
 // @ts-ignore
 grammars = grammars.flat();
 displayData = displayData.concat(grammars.map(elem => ({...elem, type: "grammar"}))).concat(words.map(elem => ({...elem, type: "word"})));
 displayData.sort((a, b) => {
   if(a.start > b.start){
     return 1;
   } else {
     if(a.start < b.start){
       return -1;
     } else {
       if(a.text.length > b.text.length){
         return 1;
       } else {
         return -1;
       }
     }
   }
 });
 displayData = displayData.map((elem, index) => ({...elem, index}));
 console.log(displayData);
 return(
     <>
      <Container style={{marginTop:"2rem", marginBottom:"2rem", fontSize:"2rem"}}>
        <TokenBody style={{border: "none"}} start={0} level={500} color={"none"}>{data.sent}</TokenBody>
        {displayData.map(elem => <Token show={elem.index === activeIndex} {...elem}>{elem.text}</Token>)}
      </Container>
       <div style={{display:"flex"}}>
         <div>
           <h5 style={{marginTop:"1rem"}}>Recognized words:</h5>
           <ul>
             {displayData.filter(elem => elem.type === "word").map(elem => <li onMouseEnter={() => setActiveIndex(elem.index)} onMouseLeave={() => setActiveIndex(null)}>{elem.message}</li>)}
           </ul>
         </div>
         <div style={{marginLeft: "5rem"}}>
           <h5 style={{marginTop:"1rem"}}>Recognized grammars:</h5>
           <ul>
             {displayData.filter(elem => elem.type === "grammar").map(elem => <li onMouseEnter={() => setActiveIndex(elem.index)} onMouseLeave={() => setActiveIndex(null)}>{elem.message}</li>)}
           </ul>
         </div>
       </div>
         <div>
           <h5 style={{marginTop:"1rem"}}>Pos tags:</h5>
           <Table>
             <thead>
             <tr>
               <th>#</th>
               <th>Base form</th>
               <th>Part of speech</th>
               <th>Surface form</th>
               <th>Pronounciation</th>
             </tr>
             </thead>
             <tbody>
             {data.pos_tags.map(([base, pos, surface, _, _2, pron], index) => (
                 <tr>
                   <th scope="row">{index + 1}</th>
                   <td>{base}</td>
                   <td>{(pos as unknown as string[]).join(", ")}</td>
                   <td>{surface}</td>
                   <td>{pron.replace("xtsu", "-")}</td>
                 </tr>
             ))}
             </tbody>
           </Table>
         </div>
    </>
  );
}

interface TokenProps{
  show?: boolean;
  start: number;
  color: string;
  level: number;
  message: string;
  children?: ReactNode;
}

function Token(props: TokenProps){
  const [hovering, setHovering] = useState(false);
  return(
      <StyledTooltip duration={0} animation="scale" content={<span>{props.message}</span>} visible={!!(hovering||props.show)}>
        <TokenBody hovering={!!(hovering||props.show)} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} {...props}>{props.children}</TokenBody>
      </StyledTooltip>
  );
}

const StyledTooltip = styled(Tippy)<{start: number}>`
  margin-left: ${props => props.start*2}rem;
`;

const TokenBody = styled.div<{start: number, color: string, level: number, hovering: boolean}>`
  cursor: pointer;
  display: inline;
  position: absolute;
  border-radius: 0.5rem;
  border: 1px solid black;
  background-color: ${props => props.color};
  transform: translateX(${props => props.start*2}rem);
  z-index: ${props => 500 - props.level};
  ${props => props.hovering && "z-index: 9999;"}
`;

const Container = styled.div`
  position: relative;
  height: 1rem;
`;

const Page = styled.div`
  width: 66%;
  margin-left: auto;
  margin-right: auto;
  @media scren and (max-width: 600px) {
    width: 100%;
  }
`;

const TextArea = styled(Input)`
  min-height: 15rem;
  resize: vertical;
`;
