package com.dailyquestion.mapper;

import com.dailyquestion.domain.Category;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper {

    @Select("""
            select id, name, created_at, created_by
            from categories
            order by name asc
            """)
    List<Category> findAll();

    @Select("""
            select id, name, created_at, created_by
            from categories
            where name = #{name}
            limit 1
            """)
    Category findByName(@Param("name") String name);

    @Insert("""
            insert into categories (id, name, created_at, created_by)
            values (#{id}, #{name}, #{createdAt}, #{createdBy})
            """)
    int insert(Category category);
}
