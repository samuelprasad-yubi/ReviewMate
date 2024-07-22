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
