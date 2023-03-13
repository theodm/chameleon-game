import com.github.gradle.node.NodePlugin

plugins {
    id("com.github.node-gradle.node") version "3.5.1" apply false
}

subprojects {
    apply(plugin = "com.github.node-gradle.node")

}