using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.Infrastructure.SeedData;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            Console.WriteLine("✅ Data already exists, skipping seed");
            return;
        }

        var random = new Random(42);
        var now = DateTime.UtcNow;

        // Create 10 users
        var users = new List<User>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Email = "admin@taskflow.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), FullName = "Admin", CreatedAt = now.AddDays(-60) },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Email = "nguyen.van.a@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Nguyễn Văn A", CreatedAt = now.AddDays(-50) },
            new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Email = "le.thi.b@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Lê Thị B", CreatedAt = now.AddDays(-45) },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Email = "tran.van.c@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Trần Văn C", CreatedAt = now.AddDays(-40) },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Email = "pham.thi.d@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Phạm Thị D", CreatedAt = now.AddDays(-35) },
            new() { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), Email = "hoang.van.e@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Hoàng Văn E", CreatedAt = now.AddDays(-30) },
            new() { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), Email = "vu.thi.f@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Vũ Thị F", CreatedAt = now.AddDays(-25) },
            new() { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), Email = "dang.van.g@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Đặng Văn G", CreatedAt = now.AddDays(-20) },
            new() { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Email = "nguyen.thi.h@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), FullName = "Nguyễn Thị H", CreatedAt = now.AddDays(-15) },
            new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Email = "user@test.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), FullName = "User Test", CreatedAt = now.AddDays(-10) },
        };
        
        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        // Create groups
        var groups = new List<Group>
        {
            new() { Id = Guid.Parse("aaaa1111-1111-1111-1111-111111111111"), Name = "Dự án Website Công ty", Description = "Phát triển website mới cho công ty", OwnerId = users[0].Id, InviteCode = "WEB2024A", CreatedAt = now.AddDays(-30) },
            new() { Id = Guid.Parse("aaaa2222-2222-2222-2222-222222222222"), Name = "Mobile App Development", Description = "Phát triển ứng dụng di động", OwnerId = users[1].Id, InviteCode = "MOBILE24", CreatedAt = now.AddDays(-25) },
            new() { Id = Guid.Parse("aaaa3333-3333-3333-3333-333333333333"), Name = "Marketing Campaign Q1", Description = "Chiến dịch marketing quý 1", OwnerId = users[2].Id, InviteCode = "MKTQ12024", CreatedAt = now.AddDays(-20) },
            new() { Id = Guid.Parse("aaaa4444-4444-4444-4444-444444444444"), Name = "Team Backend", Description = "Nhóm phát triển Backend", OwnerId = users[3].Id, InviteCode = "BACKDEV", CreatedAt = now.AddDays(-15) },
            new() { Id = Guid.Parse("aaaa5555-5555-5555-5555-555555555555"), Name = "UI/UX Design Team", Description = "Nhóm thiết kế UI/UX", OwnerId = users[4].Id, InviteCode = "UIDESIGN", CreatedAt = now.AddDays(-10) },
        };

        await context.Groups.AddRangeAsync(groups);
        await context.SaveChangesAsync();

        // Add members to groups
        var groupMembers = new List<GroupMember>
        {
            // Website group members
            new() { GroupId = groups[0].Id, UserId = users[0].Id, CreatedAt = now.AddDays(-30) },
            new() { GroupId = groups[0].Id, UserId = users[1].Id, CreatedAt = now.AddDays(-28) },
            new() { GroupId = groups[0].Id, UserId = users[2].Id, CreatedAt = now.AddDays(-26) },
            new() { GroupId = groups[0].Id, UserId = users[5].Id, CreatedAt = now.AddDays(-20) },
            new() { GroupId = groups[0].Id, UserId = users[7].Id, CreatedAt = now.AddDays(-15) },
            
            // Mobile App group members
            new() { GroupId = groups[1].Id, UserId = users[1].Id, CreatedAt = now.AddDays(-25) },
            new() { GroupId = groups[1].Id, UserId = users[3].Id, CreatedAt = now.AddDays(-23) },
            new() { GroupId = groups[1].Id, UserId = users[4].Id, CreatedAt = now.AddDays(-21) },
            new() { GroupId = groups[1].Id, UserId = users[6].Id, CreatedAt = now.AddDays(-18) },
            new() { GroupId = groups[1].Id, UserId = users[8].Id, CreatedAt = now.AddDays(-10) },
            
            // Marketing group members
            new() { GroupId = groups[2].Id, UserId = users[2].Id, CreatedAt = now.AddDays(-20) },
            new() { GroupId = groups[2].Id, UserId = users[4].Id, CreatedAt = now.AddDays(-18) },
            new() { GroupId = groups[2].Id, UserId = users[7].Id, CreatedAt = now.AddDays(-15) },
            new() { GroupId = groups[2].Id, UserId = users[9].Id, CreatedAt = now.AddDays(-5) },
            
            // Backend team members
            new() { GroupId = groups[3].Id, UserId = users[3].Id, CreatedAt = now.AddDays(-15) },
            new() { GroupId = groups[3].Id, UserId = users[0].Id, CreatedAt = now.AddDays(-12) },
            new() { GroupId = groups[3].Id, UserId = users[5].Id, CreatedAt = now.AddDays(-10) },
            new() { GroupId = groups[3].Id, UserId = users[8].Id, CreatedAt = now.AddDays(-8) },
            
            // UI/UX team members
            new() { GroupId = groups[4].Id, UserId = users[4].Id, CreatedAt = now.AddDays(-10) },
            new() { GroupId = groups[4].Id, UserId = users[6].Id, CreatedAt = now.AddDays(-8) },
            new() { GroupId = groups[4].Id, UserId = users[2].Id, CreatedAt = now.AddDays(-5) },
        };

        await context.GroupMembers.AddRangeAsync(groupMembers);
        await context.SaveChangesAsync();

        // Create boards (sprints) for each group
        var boards = new List<TaskBoard>
        {
            // Website group boards
            new() { Id = Guid.Parse("bbbb1111-1111-1111-1111-111111111111"), Name = "Sprint 1 - Design", Description = "Thiết kế giao diện và UX", OwnerId = users[0].Id, GroupId = groups[0].Id, CreatedAt = now.AddDays(-28) },
            new() { Id = Guid.Parse("bbbb2222-2222-2222-2222-222222222222"), Name = "Sprint 2 - Frontend", Description = "Phát triển frontend", OwnerId = users[0].Id, GroupId = groups[0].Id, CreatedAt = now.AddDays(-20) },
            new() { Id = Guid.Parse("bbbb3333-3333-3333-3333-333333333333"), Name = "Sprint 3 - Backend", Description = "Phát triển backend API", OwnerId = users[0].Id, GroupId = groups[0].Id, CreatedAt = now.AddDays(-12) },
            new() { Id = Guid.Parse("bbbb4444-4444-4444-4444-444444444444"), Name = "Sprint 4 - Testing", Description = "Kiểm thử và triển khai", OwnerId = users[0].Id, GroupId = groups[0].Id, CreatedAt = now.AddDays(-5) },

            // Mobile App group boards
            new() { Id = Guid.Parse("bbbb5555-5555-5555-5555-555555555555"), Name = "Alpha Release", Description = "Phát hành phiên bản alpha", OwnerId = users[1].Id, GroupId = groups[1].Id, CreatedAt = now.AddDays(-22) },
            new() { Id = Guid.Parse("bbbb6666-6666-6666-6666-666666666666"), Name = "Beta Release", Description = "Phát hành phiên bản beta", OwnerId = users[1].Id, GroupId = groups[1].Id, CreatedAt = now.AddDays(-14) },
            new() { Id = Guid.Parse("bbbb7777-7777-7777-7777-777777777777"), Name = "Release Candidate", Description = "Hoàn thiện sản phẩm", OwnerId = users[1].Id, GroupId = groups[1].Id, CreatedAt = now.AddDays(-6) },

            // Marketing group boards
            new() { Id = Guid.Parse("bbbb8888-8888-8888-8888-888888888888"), Name = "Campaign Planning", Description = "Lập kế hoạch chiến dịch", OwnerId = users[2].Id, GroupId = groups[2].Id, CreatedAt = now.AddDays(-18) },
            new() { Id = Guid.Parse("bbbb9999-9999-9999-9999-999999999999"), Name = "Content Creation", Description = "Tạo nội dung marketing", OwnerId = users[2].Id, GroupId = groups[2].Id, CreatedAt = now.AddDays(-10) },
            new() { Id = Guid.Parse("bbbbAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"), Name = "Campaign Execution", Description = "Triển khai chiến dịch", OwnerId = users[2].Id, GroupId = groups[2].Id, CreatedAt = now.AddDays(-3) },

            // Backend team boards
            new() { Id = Guid.Parse("bbbbBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB"), Name = "API Design", Description = "Thiết kế kiến trúc API", OwnerId = users[3].Id, GroupId = groups[3].Id, CreatedAt = now.AddDays(-13) },
            new() { Id = Guid.Parse("bbbbCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC"), Name = "Database Migration", Description = "Chuyển đổi cơ sở dữ liệu", OwnerId = users[3].Id, GroupId = groups[3].Id, CreatedAt = now.AddDays(-8) },
            new() { Id = Guid.Parse("bbbbDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD"), Name = "Performance Optimization", Description = "Tối ưu hiệu suất", OwnerId = users[3].Id, GroupId = groups[3].Id, CreatedAt = now.AddDays(-2) },

            // UI/UX team boards
            new() { Id = Guid.Parse("bbbbEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE"), Name = "Brand Identity", Description = "Thiết kế thương hiệu", OwnerId = users[4].Id, GroupId = groups[4].Id, CreatedAt = now.AddDays(-8) },
            new() { Id = Guid.Parse("bbbbFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"), Name = "Component Library", Description = "Thư viện component", OwnerId = users[4].Id, GroupId = groups[4].Id, CreatedAt = now.AddDays(-3) },
        };

        await context.TaskBoards.AddRangeAsync(boards);
        await context.SaveChangesAsync();

        // Create tasks for each board
        var tasks = new List<TaskItem>();
        var taskId = 1;

        var statuses = new[] { "Todo", "InProgress", "Done", "Cancelled" };
        var priorities = new[] { "Low", "Medium", "High", "Critical" };

        var taskTitles = new Dictionary<string, string[]>
        {
            ["Design"] = new[] { "Thiết kế logo", "Thiết kế color palette", "Thiết kế typography", "Tạo mockup trang chủ", "Thiết kế trang sản phẩm", "Thiết kế trang liên hệ", "Thiết kế footer", "Thiết kế mobile menu", "Tạo icon set", "Thiết kế form đăng nhập" },
            ["Frontend"] = new[] { "Setup React project", "Cài đặt Tailwind CSS", "Tạo component Header", "Tạo component Footer", "Tạo trang chủ", "Tạo trang about", "Tạo trang contact", "Responsive design", "Tối ưu images", "Setup routing" },
            ["Backend"] = new[] { "Tạo User API", "Tạo Auth API", "Tạo Product API", "Setup database", "Tạo middleware", "Viết unit tests", "Setup CI/CD", "Tối ưu queries", "Setup caching", "API documentation" },
            ["Testing"] = new[] { "Viết test cases", "Unit testing", "Integration testing", "Performance testing", "Security testing", "User acceptance testing", "Bug reporting", "Fix critical bugs", "Regression testing", "Deploy to staging" },
            ["Mobile"] = new[] { "Setup React Native", "Tạo navigation", "Home screen UI", "Login screen", "Profile screen", "Settings screen", "Push notifications", "API integration", "Offline mode", "App store submission" },
            ["Marketing"] = new[] { "Viết blog posts", "Thiết kế banners", "Social media content", "Email campaign", "SEO optimization", "Google ads setup", "Analytics setup", "Landing page", "Video marketing", "Influencer outreach" },
            ["API"] = new[] { "Design REST API", "Setup GraphQL", "API versioning", "Rate limiting", "Authentication", "Authorization", "Swagger documentation", "WebSocket integration", "Microservices setup", "API monitoring" },
            ["Database"] = new[] { "Database design", "Migration scripts", "Backup strategy", "Performance tuning", "Index optimization", "Data validation", "Stored procedures", "Database security", "Sharding strategy", "Disaster recovery" },
        };

        foreach (var board in boards)
        {
            var boardName = board.Name.Contains("Design") ? "Design" :
                           board.Name.Contains("Frontend") ? "Frontend" :
                           board.Name.Contains("Backend") ? "Backend" :
                           board.Name.Contains("Testing") ? "Testing" :
                           board.Name.Contains("Mobile") || board.Name.Contains("Release") ? "Mobile" :
                           board.Name.Contains("Marketing") || board.Name.Contains("Campaign") ? "Marketing" :
                           board.Name.Contains("API") ? "API" :
                           board.Name.Contains("Database") ? "Database" : "General";

            var titles = taskTitles.GetValueOrDefault(boardName, new[] { "Task 1", "Task 2", "Task 3" });
            var numTasks = random.Next(5, 12);

            for (int i = 0; i < numTasks; i++)
            {
                var title = titles[i % titles.Length];
                var status = i < numTasks / 3 ? TaskItemStatus.Todo : (i < numTasks * 2 / 3 ? TaskItemStatus.InProgress : TaskItemStatus.Done);
                var priority = (TaskPriority)random.Next(4);
                var assignedTo = groupMembers.Where(gm => gm.GroupId == board.GroupId).Select(gm => gm.UserId).ToList();
                
                var task = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = $"{title} - Phase {i + 1}",
                    Description = $"Mô tả chi tiết cho {title} trong {board.Name}. Cần hoàn thành trước deadline.",
                    Status = status,
                    Priority = priority,
                    Deadline = now.AddDays(random.Next(1, 30)),
                    IsPrivate = random.Next(10) == 0,
                    BoardId = board.Id,
                    AssignedToId = assignedTo.Count > 0 ? assignedTo[random.Next(assignedTo.Count)] : null,
                    CreatedAt = now.AddDays(-random.Next(1, 15))
                };
                tasks.Add(task);
            }
        }

        await context.TaskItems.AddRangeAsync(tasks);
        await context.SaveChangesAsync();

        // Create TaskItemAssignments
        var assignments = new List<TaskItemAssignment>();
        foreach (var task in tasks.Where(t => t.AssignedToId.HasValue))
        {
            assignments.Add(new TaskItemAssignment
            {
                TaskItemId = task.Id,
                UserId = task.AssignedToId!.Value,
                CreatedAt = now
            });
        }

        if (assignments.Any())
        {
            await context.TaskItemAssignments.AddRangeAsync(assignments);
            await context.SaveChangesAsync();
        }

        Console.WriteLine("✅ Seed data created successfully!");
        Console.WriteLine($"   - {users.Count} users");
        Console.WriteLine($"   - {groups.Count} groups");
        Console.WriteLine($"   - {groupMembers.Count} group members");
        Console.WriteLine($"   - {boards.Count} boards");
        Console.WriteLine($"   - {tasks.Count} tasks");
    }
}