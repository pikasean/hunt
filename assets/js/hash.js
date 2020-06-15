function calchash(submission) {
    let strippedSubmission = submission.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let submissionHashCode = 0;
    for (let i = 0; i < strippedSubmission.length; i++) {
        let char = strippedSubmission.charCodeAt(i);
        submissionHashCode = ((submissionHashCode << 5) - submissionHashCode) + char;
        submissionHashCode = submissionHashCode & submissionHashCode;
    }
return submissionHashCode
}