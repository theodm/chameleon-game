import com.github.gradle.node.npm.task.NpmTask

tasks.register("buildClient", NpmTask::class.java) {
    dependsOn(tasks.getByName("npmInstall"))

    inputs.files(fileTree("node_modules"))
    inputs.files(fileTree("src"))
    inputs.files(fileTree("public"))

    inputs.file("package.json")
    inputs.file("package-lock.json")
    inputs.file("postcss.config.js")
    inputs.file("tailwind.config.js")
    inputs.file("tsconfig.json")

    outputs.dir("build")

    args.set(listOf("run", "build"))
}

tasks.register("copyAndBuildClient", Copy::class.java) {
    dependsOn(tasks.getByName("buildClient"))

    from(projectDir
        .toPath()
        .resolve("build")
        .toFile())

    into(project(":chameleon-server")
        .projectDir
        .toPath()
        .resolve("dist")
        .resolve("client")
        .toFile()
    )
}
