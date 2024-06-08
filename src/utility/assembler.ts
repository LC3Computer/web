type machineCodeType = {
    addr:number;
    content:string;
};

export function assembler(str:string) : machineCodeType[]{
    let codeArray = str.split("\n");
    codeArray = codeArray.map(l=>l.trim());
    
    

}