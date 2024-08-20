export const testDataGithubCodeChanges = [
    {
        sha: "cbf1a8dc880b1db36965d1fa1043f69dc7b2e017",
        filename: ".idea/misc.xml",
        status: "modified",
        additions: 2,
        deletions: 1,
        changes: 3,
        blob_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/blob/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/.idea%2Fmisc.xml",
        raw_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/raw/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/.idea%2Fmisc.xml",
        contents_url:
            "https://api.github.com/repos/samuelprasad-yubi/AdvancedJavaMasterClass/contents/.idea%2Fmisc.xml?ref=65b5d71fccfd7303a1d72849ea9dc37a64d7494c",
        patch:
            "@@ -1,5 +1,6 @@\n" +
            '+<?xml version="1.0" encoding="UTF-8"?>\n' +
            ' <project version="4">\n' +
            '-  <component name="ProjectRootManager" version="2" languageLevel="JDK_21" default="true" project-jdk-name="jbr-21" project-jdk-type="JavaSDK">\n' +
            '+  <component name="ProjectRootManager" version="2" languageLevel="JDK_20" project-jdk-name="jbr-21" project-jdk-type="JavaSDK">\n' +
            '     <output url="file://$PROJECT_DIR$/out" />\n' +
            "   </component>\n" +
            " </project>\n" +
            "\\ No newline at end of file",
    },
    {
        sha: "81d36726e106e8b96fdb0a27e6f875f5b8dae5be",
        filename: "LICENSE",
        status: "modified",
        additions: 1,
        deletions: 6,
        changes: 7,
        blob_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/blob/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/LICENSE",
        raw_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/raw/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/LICENSE",
        contents_url:
            "https://api.github.com/repos/samuelprasad-yubi/AdvancedJavaMasterClass/contents/LICENSE?ref=65b5d71fccfd7303a1d72849ea9dc37a64d7494c",
        patch:
            "@@ -1,13 +1,8 @@\n" +
            " MIT License\n" +
            " \n" +
            " Copyright (c) 2024 Samuel Prasad\n" +
            "+Hai\n" +
            " \n" +
            "-Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
            '-of this software and associated documentation files (the "Software"), to deal\n' +
            "-in the Software without restriction, including without limitation the rights\n" +
            "-to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
            "-copies of the Software, and to permit persons to whom the Software is\n" +
            "-furnished to do so, subject to the following conditions:\n" +
            " \n" +
            " The above copyright notice and this permission notice shall be included in all\n" +
            " copies or substantial portions of the Software.",
    },
    {
        sha: "795e94f85bdccd89c59634494a1c0472421094c2",
        filename:
            "easy-auth-application/src/main/java/com/jmca/easyauthapplication/controller/AuthController.java",
        status: "modified",
        additions: 9,
        deletions: 3,
        changes: 12,
        blob_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/blob/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FAuthController.java",
        raw_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/raw/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FAuthController.java",
        contents_url:
            "https://api.github.com/repos/samuelprasad-yubi/AdvancedJavaMasterClass/contents/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FAuthController.java?ref=65b5d71fccfd7303a1d72849ea9dc37a64d7494c",
        patch:
            "@@ -62,25 +62,31 @@ public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest login\n" +
            " \n" +
            '     @PostMapping("/signup")\n' +
            "     public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {\n" +
            "+\n" +
            "+\n" +
            "         if (userRepository.existsByUsername(signUpRequest.getUsername())) {\n" +
            "+            //hey\n" +
            "             return ResponseEntity.badRequest()\n" +
            '                     .body(new MessageResponse("Error: Username is already taken!"));\n' +
            "         }\n" +
            " \n" +
            "         if (userRepository.existsByEmail(signUpRequest.getEmail())) {\n" +
            "+            //hey\n" +
            "             return ResponseEntity.badRequest()\n" +
            '                     .body(new MessageResponse("Error: Email is already in use!"));\n' +
            "         }\n" +
            "+        //hey\n" +
            "         User user =\n" +
            "                 new User(\n" +
            "                         signUpRequest.getUsername(),\n" +
            "                         signUpRequest.getEmail(),\n" +
            "                         encoder.encode(signUpRequest.getPassword()));\n" +
            " \n" +
            '-        if (signUpRequest.getRole() == null || signUpRequest.getRole().equalsIgnoreCase("user")) {\n' +
            "+        if (signUpRequest.getRole() || signUpRequest.getRole()) {\n" +
            '             user.setRole("ROLE_USER");\n' +
            '-        } else if (signUpRequest.getRole().equalsIgnoreCase("admin")) {\n' +
            '-            user.setRole("ROLE_ADMIN");\n' +
            "+        } else if (signUpRequest.getRole()) {\n" +
            "+            break;\n" +
            '+            return   user.setRole("ROLE_ADMIN");\n' +
            "         } else {\n" +
            '             throw new RuntimeException("Role Not Found!");\n' +
            "         }",
    },
    {
        sha: "05017c93efa244a8ea64cb8737f9dd93831bbabc",
        filename:
            "easy-auth-application/src/main/java/com/jmca/easyauthapplication/controller/UserController.java",
        status: "modified",
        additions: 2,
        deletions: 1,
        changes: 3,
        blob_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/blob/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FUserController.java",
        raw_url:
            "https://github.com/samuelprasad-yubi/AdvancedJavaMasterClass/raw/65b5d71fccfd7303a1d72849ea9dc37a64d7494c/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FUserController.java",
        contents_url:
            "https://api.github.com/repos/samuelprasad-yubi/AdvancedJavaMasterClass/contents/easy-auth-application%2Fsrc%2Fmain%2Fjava%2Fcom%2Fjmca%2Feasyauthapplication%2Fcontroller%2FUserController.java?ref=65b5d71fccfd7303a1d72849ea9dc37a64d7494c",
        patch:
            "@@ -11,6 +11,7 @@ public class UserController {\n" +
            " \n" +
            '     @GetMapping("/is-authenticated")\n' +
            "     public ResponseEntity<Boolean> getAllBus() {\n" +
            "-        return ResponseEntity.ok(true);\n" +
            "+\n" +
            "+         ResponseEntity.ok(true);\n" +
            "     }\n" +
            " }",
    },
];

export const reviewFileDiff = `

## IMPORTANT Instructions

Input: New hunks annotated with line numbers and old hunks (replaced code). Hunks represent incomplete code fragments.
Task: Review new hunks for substantive issues using provided context and respond with comments if necessary.
Output: Review comments in markdown with exact line number ranges in new hunks. Start and end line numbers must be within the same hunk. For single-line comments, start=end line number. Must use example response format below.
Use fenced code blocks using the relevant language identifier where applicable.
Don't annotate code snippets with line numbers. Format and indent code correctly.
Do not use \`suggestion\` code blocks.
For fixes, use \`diff\` code blocks, marking changes with \`+\` or \`-\`. The line number range for comments with fix snippets must exactly match the range to replace in the new hunk.


## Example

### Example changes

---new_hunk---
\`\`\`
  z = x / y
    return z

20: def add(x, y):
21:     z = x + y
22:     retrn z
23: 
24: def multiply(x, y):
25:     return x * y

def subtract(x, y):
  z = x - y
\`\`\`
  
---old_hunk---
\`\`\`
  z = x / y
    return z

def add(x, y):
    return x + y

def subtract(x, y):
    z = x - y
\`\`\`

---comment_chains---
\`\`\`
Please review this change.
\`\`\`

---end_change_section---

### Example response
data: [{
 startLine: 22,
 endLine: 23,
comment: "There's a syntax error in the add function.
\`\`\`diff
-    retrn z
+    return z
\`\`\`
"}]


## code review comments
code review comments with code snippet, code snippet should be github pr code snippet formate
comments should in sequence of code snippet and should be in list format
add position of the code snippet


     ## Pull Request Review Comments template
         ### code review comments
         code review comments with code snippet, code snippet should be github pr code snippet formate
         comments should in sequence of code snippet and should be in list format.
         add explanation here why the code needs improvement, and also add code suggestions for the code snippet.

         ## review this code changes
## Changes made to \`"easy-auth-application/src/main/java/com/jmca/easyauthapplication/controller/UserController.java"\` for your review

{
  oldHunk: ' \n' +
    '     @PostMapping("/signup")\n' +
    '     public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {\n' +
    '         if (userRepository.existsByUsername(signUpRequest.getUsername())) {\n' +
    '             return ResponseEntity.badRequest()\n' +
    '                     .body(new MessageResponse("Error: Username is already taken!"));\n' +
    '         }\n' +
    ' \n' +
    '         if (userRepository.existsByEmail(signUpRequest.getEmail())) {\n' +
    '             return ResponseEntity.badRequest()\n' +
    '                     .body(new MessageResponse("Error: Email is already in use!"));\n' +
    '         }\n' +
    '         User user =\n' +
    '                 new User(\n' +
    '                         signUpRequest.getUsername(),\n' +
    '                         signUpRequest.getEmail(),\n' +
    '                         encoder.encode(signUpRequest.getPassword()));\n' +
    ' \n' +
    '        if (signUpRequest.getRole() == null || signUpRequest.getRole().equalsIgnoreCase("user")) {\n' +
    '             user.setRole("ROLE_USER");\n' +
    '        } else if (signUpRequest.getRole().equalsIgnoreCase("admin")) {\n' +
    '            user.setRole("ROLE_ADMIN");\n' +
    '         } else {\n' +
    '             throw new RuntimeException("Role Not Found!");\n' +
    '         }',
  newHunk: ' \n' +
    '     @PostMapping("/signup")\n' +
    '     public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {\n' +
    '65: \n' +
    '66: \n' +
    '67:          if (userRepository.existsByUsername(signUpRequest.getUsername())) {\n' +
    '68:             //hey\n' +
    '69:              return ResponseEntity.badRequest()\n' +
    '70:                      .body(new MessageResponse("Error: Username is already taken!"));\n' +
    '71:          }\n' +
    '72:  \n' +
    '73:          if (userRepository.existsByEmail(signUpRequest.getEmail())) {\n' +
    '74:             //hey\n' +
    '75:              return ResponseEntity.badRequest()\n' +
    '76:                      .body(new MessageResponse("Error: Email is already in use!"));\n' +
    '77:          }\n' +
    '78:         //hey\n' +
    '79:          User user =\n' +
    '80:                  new User(\n' +
    '81:                          signUpRequest.getUsername(),\n' +
    '82:                          signUpRequest.getEmail(),\n' +
    '83:                          encoder.encode(signUpRequest.getPassword()));\n' +
    '84:  \n' +
    '85:         if (signUpRequest.getRole() || signUpRequest.getRole()) {\n' +
    '86:              user.setRole("ROLE_USER");\n' +
    '87:         } else if (signUpRequest.getRole()) {\n' +
    '88:             break;\n' +
    '89:             return   user.setRole("ROLE_ADMIN");\n' +
    '         } else {\n' +
    '             throw new RuntimeException("Role Not Found!");\n' +
    '         }'
}
    ---end_change_section---

Strictly respond in JSON formate. the JSON should have the following format:
#typescript interface
"interface Response {
  data: Array<{startLine: number; endLine: number; comment: string}>
}"

`;
