export const getDiffWithLineNumbers = (file) => {
    const patch = file.patch;
    const lines = patch.split("\n");

    let result = "";
    lines.forEach((line, index) => {
        if (line.startsWith("@@")) {
            const match = line.match(/@@ -\d+,\d+ \+(\d+),(\d+) @@/);
            if (match) {
                //const startLine = parseInt(match[1], 10);
                result += `${line}\n`;
            }
        } else {
            result += `Line ${index+1}: ${line}\n   
            `;
        }
    });

    return result;
};
